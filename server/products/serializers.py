from rest_framework import serializers
from .models import (
    Category, Brand, Product, ProductImage, ProductAttribute, Review, Wishlist,
    FilterAttribute, FilterAttributeOption, ProductVariant
)


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'is_active', 'subcategories']
    
    def get_subcategories(self, obj):
        if obj.is_parent:
            return CategorySerializer(obj.subcategories.filter(is_active=True), many=True).data
        return []


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'logo', 'description', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_main', 'order']


class FilterAttributeOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilterAttributeOption
        fields = ['id', 'value', 'color_code']


class FilterAttributeSerializer(serializers.ModelSerializer):
    options = FilterAttributeOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = FilterAttribute
        fields = ['id', 'name', 'slug', 'field_type', 'options']


class ProductAttributeSerializer(serializers.ModelSerializer):
    filter_attribute = FilterAttributeSerializer(read_only=True)
    
    class Meta:
        model = ProductAttribute
        fields = ['id', 'filter_attribute', 'value']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'title', 'comment', 'is_verified_purchase', 'helpful_votes', 'created_at']
        read_only_fields = ['user', 'is_verified_purchase', 'helpful_votes', 'created_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.ReadOnlyField()
    effective_old_price = serializers.ReadOnlyField()
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'name', 'price', 'old_price', 'stock_quantity', 'attributes', 'is_active', 'effective_price', 'effective_old_price']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product list view (minimal data)"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    discount_amount = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'short_description', 'category', 'brand', 'price', 'old_price', 
            'discount_percentage', 'slug', 'is_featured', 'is_new_arrival', 'main_image',
            'average_rating', 'review_count', 'discount_amount', 'is_on_sale', 'availability',
            'stock_quantity'
        ]

    def get_main_image(self, obj):
        main_img = obj.images.filter(is_main=True).first()
        if main_img:
            return main_img.image  # Already a URL string
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product detail view (complete data)"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    attributes = ProductAttributeSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    discount_amount = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()
    related_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'short_description', 'category', 'brand', 'price', 
            'old_price', 'discount_percentage', 'stock_quantity', 'availability', 'sku', 
            'weight', 'dimensions', 'slug', 'is_active', 'is_featured', 'is_new_arrival',
            'images', 'attributes', 'variants', 'reviews', 'average_rating', 'review_count', 
            'discount_amount', 'is_on_sale', 'related_products', 'created_at', 'updated_at'
        ]
    
    def get_related_products(self, obj):
        related = Product.objects.filter(
            category=obj.category,
            is_active=True
        ).exclude(id=obj.id)[:6]
        return ProductListSerializer(related, many=True, context=self.context).data


class CategoryFilterSerializer(serializers.ModelSerializer):
    """Serializer for category with its filterable attributes"""
    filter_attributes = FilterAttributeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'filter_attributes']


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)