from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Prefetch
from django.shortcuts import get_object_or_404

from .models import (
    Product, Category, Subcategory, Color, Material, ProductVariant,
    ProductReview, ProductRecommendation, ProductSpecification,
    ProductFeature, ProductOffer
)
from .serializers import (
    ProductListSerializer, ProductDetailSerializer, ProductSearchSerializer,
    CategorySerializer, SubcategorySerializer, ColorSerializer, MaterialSerializer,
    ProductReviewSerializer, ProductFilterSerializer, ProductOfferSerializer
)
from .filters import ProductFilter, ProductSortFilter, ProductAggregationFilter


class StandardResultsSetPagination(PageNumberPagination):
    """Custom pagination for product lists"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProductListView(generics.ListAPIView):
    """Product listing with advanced filtering and sorting"""
    serializer_class = ProductListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'short_description', 'category__name', 'subcategory__name', 'brand', 'material']
    ordering_fields = ['price', 'created_at', 'average_rating', 'review_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get products with optimized queries"""
        queryset = Product.objects.filter(is_active=True).select_related(
            'category', 'subcategory'
        ).prefetch_related(
            'images',
            'reviews',
            Prefetch('variants', queryset=ProductVariant.objects.filter(is_active=True).select_related('color'))
        )
        
        # Apply sorting
        sort_option = self.request.query_params.get('sort', 'relevance')
        queryset = ProductSortFilter.apply_sorting(queryset, sort_option)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to include filter options"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get filter options for the current queryset
        filter_options = ProductAggregationFilter.get_filter_options(queryset)
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            paginated_response.data['filter_options'] = filter_options
            return paginated_response
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'filter_options': filter_options
        })


class ProductDetailView(generics.RetrieveAPIView):
    """Detailed product view with all related data"""
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Get product with all related data"""
        return Product.objects.filter(is_active=True).select_related(
            'category', 'subcategory'
        ).prefetch_related(
            'images',
            'specifications',
            'features',
            'offers',
            'reviews',
            Prefetch('variants', queryset=ProductVariant.objects.filter(is_active=True).select_related('color')),
            Prefetch('recommendations__recommended_product', 
                    queryset=Product.objects.filter(is_active=True))
        )


class ProductSearchView(generics.ListAPIView):
    """Advanced product search"""
    serializer_class = ProductSearchSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'short_description', 'long_description', 'category__name', 'subcategory__name', 'brand', 'material']
    
    def get_queryset(self):
        """Get products for search"""
        return Product.objects.filter(is_active=True).select_related(
            'category', 'subcategory'
        )


class CategoryListView(generics.ListAPIView):
    """List all categories with subcategories"""
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Category.objects.filter(is_active=True).prefetch_related(
            'subcategories'
        ).order_by('sort_order', 'name')


class SubcategoryListView(generics.ListAPIView):
    """List subcategories for a specific category"""
    serializer_class = SubcategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        category_slug = self.kwargs.get('category_slug')
        if category_slug:
            return Subcategory.objects.filter(
                category__slug=category_slug,
                is_active=True
            ).order_by('sort_order', 'name')
        return Subcategory.objects.filter(is_active=True).order_by('sort_order', 'name')


class ColorListView(generics.ListAPIView):
    """List all available colors"""
    serializer_class = ColorSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Color.objects.filter(is_active=True).order_by('name')


class MaterialListView(generics.ListAPIView):
    """List all available materials"""
    serializer_class = MaterialSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Material.objects.filter(is_active=True).order_by('name')


class ProductReviewListView(generics.ListCreateAPIView):
    """List and create product reviews"""
    serializer_class = ProductReviewSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        product_slug = self.kwargs.get('slug')
        return ProductReview.objects.filter(
            product__slug=product_slug,
            is_approved=True
        ).select_related('user').order_by('-created_at')
    
    def perform_create(self, serializer):
        product_slug = self.kwargs.get('slug')
        product = get_object_or_404(Product, slug=product_slug)
        serializer.save(product=product, user=self.request.user)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_products(request):
    """Get featured products for homepage"""
    products = Product.objects.filter(
        is_active=True,
        is_featured=True
    ).select_related('category', 'subcategory').prefetch_related(
        'images', 'variants__color'
    ).order_by('-created_at')[:10]
    
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_new_arrivals(request):
    """Get new arrival products"""
    products = Product.objects.filter(
        is_active=True
    ).select_related('category', 'subcategory').prefetch_related(
        'images', 'variants__color'
    ).order_by('-created_at')[:20]
    
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_home_data(request):
    """Get all data needed for homepage"""
    # Featured products
    featured_products = Product.objects.filter(
        is_active=True,
        is_featured=True
    ).select_related('category', 'subcategory').prefetch_related(
        'images', 'variants__color'
    ).order_by('-created_at')[:10]
    
    # New arrivals
    new_arrivals = Product.objects.filter(
        is_active=True
    ).select_related('category', 'subcategory').prefetch_related(
        'images', 'variants__color'
    ).order_by('-created_at')[:20]
    
    # Categories
    categories = Category.objects.filter(is_active=True).prefetch_related(
        'subcategories'
    ).order_by('sort_order', 'name')
    
    return Response({
        'featured_products': ProductListSerializer(featured_products, many=True).data,
        'new_arrivals': ProductListSerializer(new_arrivals, many=True).data,
        'categories': CategorySerializer(categories, many=True).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_search_suggestions(request):
    """Get search suggestions based on query"""
    query = request.GET.get('q', '').strip()
    
    if len(query) < 2:
        return Response([])
    
    # Get product suggestions
    products = Product.objects.filter(
        Q(title__icontains=query) |
        Q(category__name__icontains=query) |
        Q(subcategory__name__icontains=query),
        is_active=True
    ).values('title', 'slug', 'category__name')[:10]
    
    # Get category suggestions
    categories = Category.objects.filter(
        name__icontains=query,
        is_active=True
    ).values('name', 'slug')[:5]
    
    # Get subcategory suggestions
    subcategories = Subcategory.objects.filter(
        name__icontains=query,
        is_active=True
    ).values('name', 'slug', 'category__name')[:5]
    
    suggestions = []
    
    # Add product suggestions
    for product in products:
        suggestions.append({
            'type': 'product',
            'title': product['title'],
            'subtitle': product['category__name'],
            'slug': product['slug']
        })
    
    # Add category suggestions
    for category in categories:
        suggestions.append({
            'type': 'category',
            'title': category['name'],
            'subtitle': 'Category',
            'slug': category['slug']
        })
    
    # Add subcategory suggestions
    for subcategory in subcategories:
        suggestions.append({
            'type': 'subcategory',
            'title': subcategory['name'],
            'subtitle': f"in {subcategory['category__name']}",
            'slug': subcategory['slug']
        })
    
    return Response(suggestions[:15])  # Limit total suggestions


@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_recommendations(request, slug):
    """Get product recommendations for a specific product"""
    product = get_object_or_404(Product, slug=slug, is_active=True)
    
    # Get different types of recommendations
    buy_with = ProductRecommendation.objects.filter(
        product=product,
        recommendation_type='buy_with',
        is_active=True
    ).select_related('recommended_product')[:10]
    
    inspired_by = ProductRecommendation.objects.filter(
        product=product,
        recommendation_type='inspired_by',
        is_active=True
    ).select_related('recommended_product')[:10]
    
    frequently_viewed = ProductRecommendation.objects.filter(
        product=product,
        recommendation_type='frequently_viewed',
        is_active=True
    ).select_related('recommended_product')[:10]
    
    similar = ProductRecommendation.objects.filter(
        product=product,
        recommendation_type='similar',
        is_active=True
    ).select_related('recommended_product')[:10]
    
    recommended = ProductRecommendation.objects.filter(
        product=product,
        recommendation_type='recommended',
        is_active=True
    ).select_related('recommended_product')[:10]
    
    return Response({
        'buy_with': ProductListSerializer([rec.recommended_product for rec in buy_with], many=True).data,
        'inspired_by': ProductListSerializer([rec.recommended_product for rec in inspired_by], many=True).data,
        'frequently_viewed': ProductListSerializer([rec.recommended_product for rec in frequently_viewed], many=True).data,
        'similar': ProductListSerializer([rec.recommended_product for rec in similar], many=True).data,
        'recommended': ProductListSerializer([rec.recommended_product for rec in recommended], many=True).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_filter_options(request):
    """Get available filter options"""
    # Get base queryset
    queryset = Product.objects.filter(is_active=True)
    
    # Apply any existing filters
    filter_params = request.GET.copy()
    if 'category' in filter_params:
        queryset = queryset.filter(category__slug=filter_params['category'])
    if 'subcategory' in filter_params:
        queryset = queryset.filter(subcategory__slug=filter_params['subcategory'])
    
    # Get filter options
    filter_options = ProductAggregationFilter.get_filter_options(queryset)
    
    return Response(filter_options)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_offers(request):
    """Get all products with active offers for advertisement boxes"""
    from django.utils import timezone
    
    now = timezone.now()
    
    # Get all products with active offers
    offers = ProductOffer.objects.filter(
        is_active=True
    ).filter(
        Q(valid_from__isnull=True) | Q(valid_from__lte=now),
        Q(valid_until__isnull=True) | Q(valid_until__gte=now)
    ).select_related('product').prefetch_related(
        'product__images'
    ).order_by('-created_at')
    
    # Serialize offers with product data
    serialized_offers = []
    for offer in offers:
        serialized_offers.append({
            'id': offer.id,
            'title': offer.title,
            'description': offer.description,
            'discount_percentage': offer.discount_percentage,
            'discount_amount': offer.discount_amount,
            'valid_from': offer.valid_from,
            'valid_until': offer.valid_until,
            'product': {
                'id': offer.product.id,
                'title': offer.product.title,
                'slug': offer.product.slug,
                'main_image': offer.product.main_image,
                'price': offer.product.price,
                'old_price': offer.product.old_price,
                'category': offer.product.category.name if offer.product.category else None
            }
        })
    
    return Response({
        'count': len(serialized_offers),
        'results': serialized_offers
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_offer(request):
    """Create a new product offer"""
    from rest_framework import status
    
    # Check if user is admin or staff
    if not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {'error': 'You do not have permission to create offers.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    product_id = request.data.get('product_id')
    title = request.data.get('title')
    description = request.data.get('description', '')
    discount_percentage = request.data.get('discount_percentage')
    discount_amount = request.data.get('discount_amount')
    is_active = request.data.get('is_active', True)
    valid_from = request.data.get('valid_from')
    valid_until = request.data.get('valid_until')
    
    # Validation
    if not product_id:
        return Response(
            {'error': 'product_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not title:
        return Response(
            {'error': 'title is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create the offer
    offer = ProductOffer.objects.create(
        product=product,
        title=title,
        description=description,
        discount_percentage=discount_percentage,
        discount_amount=discount_amount,
        is_active=is_active,
        valid_from=valid_from,
        valid_until=valid_until
    )
    
    # Serialize the created offer
    serializer = ProductOfferSerializer(offer)
    return Response({
        'message': 'Offer created successfully',
        'offer': serializer.data
    }, status=status.HTTP_201_CREATED)