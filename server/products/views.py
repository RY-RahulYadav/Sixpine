from rest_framework import generics, filters, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Min, Max, F, Avg, Case, When, IntegerField
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import json
import re
from difflib import SequenceMatcher
from .models import (
    Category, Brand, Product, Review, Wishlist, 
    FilterAttribute, FilterAttributeOption, ProductAttribute
)
from .serializers import (
    CategorySerializer, BrandSerializer, ProductListSerializer, 
    ProductDetailSerializer, ReviewSerializer, WishlistSerializer,
    CategoryFilterSerializer, FilterAttributeSerializer
)


class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'is_featured', 'is_new_arrival', 'availability']
    search_fields = ['title', 'description', 'short_description']
    ordering_fields = ['price', 'created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category', 'brand')
        
        # Category filtering (including subcategories)
        category_slug = self.request.query_params.get('category')
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug)
                # Include all subcategories
                all_categories = [category] + category.get_all_subcategories()
                queryset = queryset.filter(category__in=all_categories)
            except Category.DoesNotExist:
                pass
        
        # Price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        # Rating filtering
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            # Filter products by average rating
            from django.db.models import Avg
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating')
            ).filter(avg_rating__gte=float(min_rating))
        
        # Dynamic attribute filtering
        for key, value in self.request.query_params.items():
            if key.startswith('attr_'):
                attribute_slug = key[5:]  # Remove 'attr_' prefix
                values = value.split(',')  # Support multiple values
                queryset = queryset.filter(
                    attributes__filter_attribute__slug=attribute_slug,
                    attributes__value__in=values
                ).distinct()
        
        # Brand filtering (multiple brands)
        brands = self.request.query_params.get('brands')
        if brands:
            brand_ids = brands.split(',')
            queryset = queryset.filter(brand__id__in=brand_ids)
        
        # Sort handling
        sort_by = self.request.query_params.get('sort')
        if sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'rating':
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by('-avg_rating')
        elif sort_by == 'popularity':
            queryset = queryset.annotate(
                review_count=Count('reviews')
            ).order_by('-review_count')
            
        return queryset
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Add filter options to response
        category_slug = request.query_params.get('category')
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug)
                filter_data = self.get_filter_options(category)
                response.data['filters'] = filter_data
            except Category.DoesNotExist:
                response.data['filters'] = {}
        else:
            response.data['filters'] = {}
            
        return response
    
    def get_filter_options(self, category):
        """Get available filter options for a category"""
        filter_options = {}
        
        # Get all products in this category (for generating filter options)
        products = Product.objects.filter(
            category__in=[category] + category.get_all_subcategories(),
            is_active=True
        )
        
        # Price range
        price_stats = products.aggregate(
            min_price=Min('price'),
            max_price=Max('price')
        )
        filter_options['price_range'] = {
            'min': float(price_stats['min_price'] or 0),
            'max': float(price_stats['max_price'] or 0)
        }
        
        # Brands available in this category
        brands = Brand.objects.filter(
            products__in=products,
            is_active=True
        ).distinct().values('id', 'name')
        filter_options['brands'] = list(brands)
        
        # Category-specific attributes
        attributes_data = {}
        for attr in category.filter_attributes.filter(is_filterable=True):
            # Get unique values for this attribute from products
            values = ProductAttribute.objects.filter(
                product__in=products,
                filter_attribute=attr
            ).values_list('value', flat=True).distinct()
            
            attributes_data[attr.slug] = {
                'name': attr.name,
                'field_type': attr.field_type,
                'values': list(values),
                'options': list(attr.options.values('value', 'color_code'))
            }
        
        filter_options['attributes'] = attributes_data
        
        return filter_options


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class FeaturedProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_featured=True)
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = ProductPagination


class NewArrivalsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_new_arrival=True)
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = ProductPagination


class ProductReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = ProductPagination

    def get_queryset(self):
        product_slug = self.kwargs.get('slug')
        return Review.objects.filter(
            product__slug=product_slug, 
            is_approved=True
        ).select_related('user', 'product')

    def perform_create(self, serializer):
        product_slug = self.kwargs.get('slug')
        product = Product.objects.get(slug=product_slug)
        serializer.save(user=self.request.user, product=product)


class WishlistView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')


class WishlistDetailView(generics.DestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)


def get_search_suggestions(query, search_terms):
    """Generate smart search suggestions based on query"""
    suggestions = []
    
    # Find similar products using fuzzy matching
    all_products = Product.objects.filter(is_active=True).values('title', 'category__name', 'brand__name')
    
    for product in all_products[:100]:  # Limit for performance
        title = product['title'].lower()
        category = product['category__name'].lower() if product['category__name'] else ''
        brand = product['brand__name'].lower() if product['brand__name'] else ''
        
        # Check similarity with original query
        title_similarity = SequenceMatcher(None, query.lower(), title).ratio()
        if title_similarity > 0.6:
            suggestions.append({
                'text': product['title'],
                'type': 'product',
                'similarity': title_similarity
            })
        
        # Check if query matches category or brand
        if query.lower() in category and category not in [s['text'].lower() for s in suggestions]:
            suggestions.append({
                'text': product['category__name'],
                'type': 'category',
                'similarity': 0.8
            })
        
        if query.lower() in brand and brand not in [s['text'].lower() for s in suggestions]:
            suggestions.append({
                'text': product['brand__name'],
                'type': 'brand',
                'similarity': 0.8
            })
    
    # Sort by similarity and return top suggestions
    suggestions.sort(key=lambda x: x['similarity'], reverse=True)
    return [s['text'] for s in suggestions[:8]]


def get_trending_searches():
    """Get trending/popular search terms"""
    # In a real application, this would come from search analytics
    # For now, return popular categories and products
    popular_categories = Category.objects.filter(
        is_active=True,
        products__isnull=False
    ).annotate(
        product_count=Count('products')
    ).order_by('-product_count')[:5].values_list('name', flat=True)
    
    popular_brands = Brand.objects.filter(
        is_active=True,
        products__isnull=False
    ).annotate(
        product_count=Count('products')
    ).order_by('-product_count')[:3].values_list('name', flat=True)
    
    trending = list(popular_categories) + list(popular_brands)
    return trending[:8]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_products(request):
    """Amazon-like advanced product search with intelligent ranking"""
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({
            'results': [],
            'count': 0,
            'suggestions': [],
            'trending': get_trending_searches(),
            'query': query
        })
    
    # Clean and prepare search terms
    search_terms = [term.strip() for term in re.split(r'[\s,]+', query.lower()) if term.strip()]
    
    # Build comprehensive search query with ranking
    search_queryset = Product.objects.filter(is_active=True)
    
    # Exact title match (highest priority)
    exact_title_match = Q(title__iexact=query)
    
    # Title contains query (high priority)
    title_contains = Q(title__icontains=query)
    
    # Build term-based queries
    term_queries = Q()
    for term in search_terms:
        term_queries |= (
            Q(title__icontains=term) |
            Q(short_description__icontains=term) |
            Q(description__icontains=term) |
            Q(category__name__icontains=term) |
            Q(brand__name__icontains=term) |
            Q(sku__icontains=term) |
            Q(attributes__value__icontains=term)
        )
    
    # Category and brand specific searches
    category_match = Q(category__name__icontains=query)
    brand_match = Q(brand__name__icontains=query)
    
    # Combine all search conditions
    combined_query = (
        exact_title_match |
        title_contains |
        category_match |
        brand_match |
        term_queries
    )
    
    # Apply search filter
    products = search_queryset.filter(combined_query).distinct()
    
    # Add ranking based on relevance
    products = products.annotate(
        relevance_score=Case(
            # Exact title match gets highest score
            When(exact_title_match, then=100),
            # Title contains query gets high score
            When(title_contains, then=80),
            # Brand match gets good score
            When(brand_match, then=70),
            # Category match gets moderate score
            When(category_match, then=60),
            # Everything else gets base score
            default=40,
            output_field=IntegerField()
        ),
        # Boost popular products (more reviews = more popular)
        popularity_boost=Count('reviews', distinct=True) * 5,
        # Boost newer products
        recency_boost=Case(
            When(created_at__gte=timezone.now() - timedelta(days=30), then=10),
            When(created_at__gte=timezone.now() - timedelta(days=90), then=5),
            default=0,
            output_field=IntegerField()
        ),
        # Calculate final score
        final_score=F('relevance_score') + F('popularity_boost') + F('recency_boost')
    ).order_by('-final_score', '-created_at')
    
    # Pagination
    page_size = int(request.GET.get('page_size', 20))
    page = int(request.GET.get('page', 1))
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    
    total_count = products.count()
    paginated_products = products[start_index:end_index]
    
    # Get search suggestions if results are limited
    suggestions = []
    if total_count < 5:
        suggestions = get_search_suggestions(query, search_terms)
    
    serializer = ProductListSerializer(paginated_products, many=True, context={'request': request})
    
    return Response({
        'results': serializer.data,
        'count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size,
        'suggestions': suggestions,
        'trending': get_trending_searches() if total_count == 0 else [],
        'query': query,
        'search_terms': search_terms,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_suggestions(request):
    """Get real-time search suggestions as user types"""
    query = request.GET.get('q', '').strip()
    if not query or len(query) < 2:
        return Response({
            'suggestions': [],
            'trending': get_trending_searches()
        })
    
    suggestions = []
    
    # Product title suggestions (exact and partial matches)
    product_titles = Product.objects.filter(
        title__icontains=query,
        is_active=True
    ).values_list('title', flat=True)[:6]
    
    for title in product_titles:
        suggestions.append({
            'text': title,
            'type': 'product',
            'icon': 'product'
        })
    
    # Category suggestions
    categories = Category.objects.filter(
        name__icontains=query,
        is_active=True
    ).values_list('name', flat=True)[:3]
    
    for category in categories:
        suggestions.append({
            'text': category,
            'type': 'category',
            'icon': 'category'
        })
    
    # Brand suggestions
    brands = Brand.objects.filter(
        name__icontains=query,
        is_active=True
    ).values_list('name', flat=True)[:3]
    
    for brand in brands:
        suggestions.append({
            'text': brand,
            'type': 'brand',
            'icon': 'brand'
        })
    
    # Add "search for" suggestion as fallback
    if suggestions:
        suggestions.insert(0, {
            'text': query,
            'type': 'search',
            'icon': 'search',
            'label': f'Search for "{query}"'
        })
    
    return Response({
        'suggestions': suggestions[:10],
        'query': query
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def category_filters(request, slug):
    """Get filter options for a specific category"""
    try:
        category = Category.objects.get(slug=slug, is_active=True)
        serializer = CategoryFilterSerializer(category)
        
        # Get additional filter data
        products = Product.objects.filter(
            category__in=[category] + category.get_all_subcategories(),
            is_active=True
        )
        
        # Price range
        price_stats = products.aggregate(
            min_price=Min('price'),
            max_price=Max('price')
        )
        
        # Brands
        brands = Brand.objects.filter(
            products__in=products,
            is_active=True
        ).distinct()
        
        response_data = serializer.data
        response_data['price_range'] = {
            'min': float(price_stats['min_price'] or 0),
            'max': float(price_stats['max_price'] or 0)
        }
        response_data['brands'] = BrandSerializer(brands, many=True).data
        
        return Response(response_data)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=404)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def home_data(request):
    """Get data for home page"""
    featured_products = Product.objects.filter(is_active=True, is_featured=True)[:12]
    new_arrivals = Product.objects.filter(is_active=True, is_new_arrival=True)[:12]
    
    # Get top-level categories only
    categories = Category.objects.filter(is_active=True, parent__isnull=True)[:8]
    
    # Get popular products (based on review count)
    popular_products = Product.objects.filter(
        is_active=True
    ).annotate(
        total_reviews=Count('reviews')
    ).order_by('-total_reviews')[:12]
    
    # Get on-sale products
    sale_products = Product.objects.filter(
        is_active=True,
        old_price__gt=0
    ).exclude(old_price__lte=F('price'))[:12]
    
    return Response({
        'featured_products': ProductListSerializer(featured_products, many=True, context={'request': request}).data,
        'new_arrivals': ProductListSerializer(new_arrivals, many=True, context={'request': request}).data,
        'popular_products': ProductListSerializer(popular_products, many=True, context={'request': request}).data,
        'sale_products': ProductListSerializer(sale_products, many=True, context={'request': request}).data,
        'categories': CategorySerializer(categories, many=True, context={'request': request}).data,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def advanced_search(request):
    """Advanced search with filters similar to Amazon"""
    query = request.GET.get('q', '').strip()
    category = request.GET.get('category')
    brand = request.GET.get('brand')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    min_rating = request.GET.get('min_rating')
    sort_by = request.GET.get('sort', 'relevance')
    
    # Start with all active products
    queryset = Product.objects.filter(is_active=True)
    
    # Apply search query if provided
    if query:
        search_terms = [term.strip() for term in re.split(r'[\s,]+', query.lower()) if term.strip()]
        search_q = Q()
        
        for term in search_terms:
            search_q |= (
                Q(title__icontains=term) |
                Q(description__icontains=term) |
                Q(category__name__icontains=term) |
                Q(brand__name__icontains=term) |
                Q(sku__icontains=term)
            )
        
        queryset = queryset.filter(search_q)
    
    # Apply filters
    if category:
        try:
            cat_obj = Category.objects.get(slug=category)
            all_cats = [cat_obj] + cat_obj.get_all_subcategories()
            queryset = queryset.filter(category__in=all_cats)
        except Category.DoesNotExist:
            pass
    
    if brand:
        queryset = queryset.filter(brand__slug=brand)
    
    if min_price:
        queryset = queryset.filter(price__gte=float(min_price))
    
    if max_price:
        queryset = queryset.filter(price__lte=float(max_price))
    
    if min_rating:
        queryset = queryset.annotate(
            avg_rating=Avg('reviews__rating')
        ).filter(avg_rating__gte=float(min_rating))
    
    # Apply sorting
    if sort_by == 'price_low_to_high':
        queryset = queryset.order_by('price')
    elif sort_by == 'price_high_to_low':
        queryset = queryset.order_by('-price')
    elif sort_by == 'newest':
        queryset = queryset.order_by('-created_at')
    elif sort_by == 'oldest':
        queryset = queryset.order_by('created_at')
    elif sort_by == 'rating':
        queryset = queryset.annotate(
            avg_rating=Avg('reviews__rating')
        ).order_by('-avg_rating', '-created_at')
    elif sort_by == 'popularity':
        queryset = queryset.annotate(
            total_reviews=Count('reviews')
        ).order_by('-total_reviews', '-created_at')
    elif sort_by == 'name_a_to_z':
        queryset = queryset.order_by('title')
    elif sort_by == 'name_z_to_a':
        queryset = queryset.order_by('-title')
    else:  # relevance (default)
        if query:
            # Add relevance scoring when there's a search query
            queryset = queryset.annotate(
                relevance_score=Case(
                    When(title__iexact=query, then=100),
                    When(title__icontains=query, then=80),
                    When(brand__name__icontains=query, then=70),
                    When(category__name__icontains=query, then=60),
                    default=40,
                    output_field=IntegerField()
                )
            ).order_by('-relevance_score', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')
    
    # Pagination
    page_size = int(request.GET.get('page_size', 24))
    page = int(request.GET.get('page', 1))
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    
    total_count = queryset.count()
    paginated_products = queryset[start_index:end_index]
    
    serializer = ProductListSerializer(paginated_products, many=True, context={'request': request})
    
    return Response({
        'results': serializer.data,
        'count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size,
        'filters': {
            'query': query,
            'category': category,
            'brand': brand,
            'min_price': min_price,
            'max_price': max_price,
            'min_rating': min_rating,
            'sort_by': sort_by
        }
    })