from rest_framework import serializers
from .models import (
    Category, Subcategory, Color, Material, Product, ProductImage, ProductVariant,
    ProductReview, ProductRecommendation, ProductSpecification, 
    ProductFeature, ProductOffer
)


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code']


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name', 'description']


class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'slug', 'description']


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'subcategories']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'sort_order']


class ProductVariantSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    color_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'color', 'color_id', 'size', 'pattern', 'price', 'old_price',
            'stock_quantity', 'is_in_stock', 'image'
        ]


class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'sort_order']


class ProductFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeature
        fields = ['id', 'feature', 'sort_order']


class ProductOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOffer
        fields = [
            'id', 'title', 'description', 'discount_percentage', 
            'discount_amount', 'valid_from', 'valid_until'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product listing pages"""
    category = CategorySerializer(read_only=True)
    subcategory = SubcategorySerializer(read_only=True)
    material = MaterialSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    
    # Available colors for filtering
    available_colors = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'short_description', 'main_image',
            'price', 'old_price', 'is_on_sale', 'discount_percentage',
            'average_rating', 'review_count', 'category', 'subcategory',
            'brand', 'material', 'images', 'variants', 'available_colors',
            'is_featured', 'created_at'
        ]
    
    def get_available_colors(self, obj):
        """Get unique colors available for this product"""
        colors = obj.variants.filter(is_active=True).values_list('color__name', flat=True).distinct()
        return list(colors)


class ProductDetailSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for product detail pages"""
    category = CategorySerializer(read_only=True)
    subcategory = SubcategorySerializer(read_only=True)
    material = MaterialSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    features = ProductFeatureSerializer(many=True, read_only=True)
    offers = ProductOfferSerializer(many=True, read_only=True)
    
    # Recommendation arrays
    buy_with_products = serializers.SerializerMethodField()
    inspired_products = serializers.SerializerMethodField()
    frequently_viewed_products = serializers.SerializerMethodField()
    similar_products = serializers.SerializerMethodField()
    recommended_products = serializers.SerializerMethodField()
    
    # Available colors and sizes for variant selection
    available_colors = serializers.SerializerMethodField()
    available_sizes = serializers.SerializerMethodField()
    available_patterns = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'short_description', 'long_description',
            'main_image', 'price', 'old_price', 'is_on_sale', 'discount_percentage',
            'average_rating', 'review_count', 'category', 'subcategory',
            'brand', 'material', 'dimensions', 'weight', 'warranty', 'assembly_required',
            'images', 'variants', 'specifications', 'features', 'offers',
            'buy_with_products', 'inspired_products', 'frequently_viewed_products',
            'similar_products', 'recommended_products',
            'available_colors', 'available_sizes', 'available_patterns',
            'meta_title', 'meta_description', 'is_featured', 'created_at', 'updated_at'
        ]
    
    def get_buy_with_products(self, obj):
        """Get 'Buy with it' recommended products"""
        recommendations = ProductRecommendation.objects.filter(
            product=obj,
            recommendation_type='buy_with',
            is_active=True
        ).select_related('recommended_product')[:10]
        
        return ProductListSerializer([rec.recommended_product for rec in recommendations], many=True).data
    
    def get_inspired_products(self, obj):
        """Get 'Inspired by browsing history' products"""
        recommendations = ProductRecommendation.objects.filter(
            product=obj,
            recommendation_type='inspired_by',
            is_active=True
        ).select_related('recommended_product')[:10]
        
        return ProductListSerializer([rec.recommended_product for rec in recommendations], many=True).data
    
    def get_frequently_viewed_products(self, obj):
        """Get frequently viewed products"""
        recommendations = ProductRecommendation.objects.filter(
            product=obj,
            recommendation_type='frequently_viewed',
            is_active=True
        ).select_related('recommended_product')[:10]
        
        return ProductListSerializer([rec.recommended_product for rec in recommendations], many=True).data
    
    def get_similar_products(self, obj):
        """Get similar products"""
        recommendations = ProductRecommendation.objects.filter(
            product=obj,
            recommendation_type='similar',
            is_active=True
        ).select_related('recommended_product')[:10]
        
        return ProductListSerializer([rec.recommended_product for rec in recommendations], many=True).data
    
    def get_recommended_products(self, obj):
        """Get recommended products"""
        recommendations = ProductRecommendation.objects.filter(
            product=obj,
            recommendation_type='recommended',
            is_active=True
        ).select_related('recommended_product')[:10]
        
        return ProductListSerializer([rec.recommended_product for rec in recommendations], many=True).data
    
    def get_available_colors(self, obj):
        """Get available colors for this product"""
        colors = obj.variants.filter(is_active=True).values('color__id', 'color__name', 'color__hex_code').distinct()
        return list(colors)
    
    def get_available_sizes(self, obj):
        """Get available sizes for this product"""
        sizes = obj.variants.filter(is_active=True).values_list('size', flat=True).distinct()
        return [size for size in sizes if size]
    
    def get_available_patterns(self, obj):
        """Get available patterns for this product"""
        patterns = obj.variants.filter(is_active=True).values_list('pattern', flat=True).distinct()
        return [pattern for pattern in patterns if pattern]


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'user_name', 'user_username', 'rating', 'title', 'comment',
            'is_verified_purchase', 'created_at'
        ]
        read_only_fields = ['user', 'product']


class ProductSearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for search results"""
    category = serializers.CharField(source='category.name', read_only=True)
    subcategory = serializers.CharField(source='subcategory.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'short_description', 'main_image',
            'price', 'old_price', 'is_on_sale', 'discount_percentage',
            'average_rating', 'review_count', 'category', 'subcategory', 'brand'
        ]


class ProductFilterSerializer(serializers.Serializer):
    """Serializer for product filtering parameters"""
    # Category filters
    category = serializers.CharField(required=False)
    subcategory = serializers.CharField(required=False)
    
    # Price filters
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    # Color filter
    color = serializers.CharField(required=False)
    
    # Material filter
    material = serializers.CharField(required=False)
    
    # Rating filter
    min_rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False)
    
    # Brand filter (though we only have Sixpine)
    brand = serializers.CharField(required=False)
    
    # Search query
    q = serializers.CharField(required=False)
    
    # Sorting
    sort = serializers.ChoiceField(choices=[
        ('relevance', 'Relevance'),
        ('price_low_to_high', 'Price: Low to High'),
        ('price_high_to_low', 'Price: High to Low'),
        ('newest', 'Newest First'),
        ('rating', 'Customer Rating'),
        ('popularity', 'Most Popular'),
    ], required=False, default='relevance')
    
    # Pagination
    page = serializers.IntegerField(required=False, default=1)
    page_size = serializers.IntegerField(required=False, default=20)