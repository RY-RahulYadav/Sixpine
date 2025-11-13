from rest_framework import serializers
from django.contrib.auth import get_user_model
from accounts.models import User
from products.models import (
    Category, Subcategory, Color, Material, Product, ProductImage, 
    ProductVariant, ProductVariantImage, ProductSpecification, ProductFeature, 
    ProductOffer, Discount, ProductRecommendation, Coupon
)
from orders.models import Order, OrderItem, OrderStatusHistory, OrderNote
from accounts.models import ContactQuery, BulkOrder, DataRequest
from .models import GlobalSettings, AdminLog, HomePageContent, BulkOrderPageContent
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


# ==================== Global Settings Serializers ====================
class GlobalSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalSettings
        fields = ['id', 'key', 'value', 'description', 'created_at', 'updated_at']


# ==================== Dashboard Serializers ====================
class DashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_products = serializers.IntegerField()
    orders_placed_count = serializers.IntegerField()
    delivered_orders_count = serializers.IntegerField()
    cod_orders_count = serializers.IntegerField()
    online_payment_orders_count = serializers.IntegerField()
    low_stock_products = serializers.IntegerField()
    recent_orders = serializers.ListField()
    top_selling_products = serializers.ListField()
    sales_by_day = serializers.ListField()


# ==================== User Serializers ====================
class AdminUserListSerializer(serializers.ModelSerializer):
    order_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'mobile',
            'is_active', 'is_staff', 'is_superuser', 'is_verified',
            'date_joined', 'last_login', 'order_count', 'total_spent'
        ]
    
    def get_order_count(self, obj):
        return obj.orders.count()
    
    def get_total_spent(self, obj):
        total = obj.orders.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        return str(total)


class AdminUserDetailSerializer(serializers.ModelSerializer):
    order_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    recent_orders = serializers.SerializerMethodField()
    addresses_count = serializers.SerializerMethodField()
    interests = serializers.JSONField(default=list, allow_null=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'mobile',
            'is_active', 'is_staff', 'is_superuser', 'is_verified',
            'date_joined', 'last_login', 'order_count', 'total_spent',
            'recent_orders', 'addresses_count', 'interests', 'advertising_enabled',
            'whatsapp_enabled', 'whatsapp_order_updates', 'whatsapp_promotional', 'email_promotional'
        ]
    
    def to_representation(self, instance):
        """Ensure empty lists are returned instead of None"""
        data = super().to_representation(instance)
        if data.get('interests') is None:
            data['interests'] = []
        if data.get('advertising_enabled') is None:
            data['advertising_enabled'] = True
        if data.get('whatsapp_enabled') is None:
            data['whatsapp_enabled'] = True
        if data.get('whatsapp_order_updates') is None:
            data['whatsapp_order_updates'] = True
        if data.get('whatsapp_promotional') is None:
            data['whatsapp_promotional'] = True
        if data.get('email_promotional') is None:
            data['email_promotional'] = True
        return data
    
    def get_order_count(self, obj):
        return obj.orders.count()
    
    def get_total_spent(self, obj):
        total = obj.orders.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        return str(total)
    
    def get_recent_orders(self, obj):
        orders = obj.orders.all()[:5]
        return [{
            'order_id': str(order.order_id),
            'status': order.status,
            'total_amount': str(order.total_amount),
            'created_at': order.created_at
        } for order in orders]
    
    def get_addresses_count(self, obj):
        return obj.addresses.count()


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'mobile',
            'password', 'is_active', 'is_staff', 'is_superuser', 'is_verified'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'mobile',
            'is_active', 'is_staff', 'is_superuser', 'is_verified'
        ]
    
    def update(self, instance, validated_data):
        """Update user instance"""
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ==================== Category & Subcategory Serializers ====================
class AdminSubcategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subcategory
        fields = [
            'id', 'name', 'slug', 'category', 'description', 'is_active',
            'sort_order', 'product_count', 'created_at', 'updated_at'
        ]
    
    def get_product_count(self, obj):
        return obj.products.count()


class AdminCategorySerializer(serializers.ModelSerializer):
    subcategories = AdminSubcategorySerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()
    subcategory_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'is_active',
            'sort_order', 'subcategories', 'product_count', 'subcategory_count',
            'created_at', 'updated_at'
        ]
    
    def get_product_count(self, obj):
        return obj.products.count()
    
    def get_subcategory_count(self, obj):
        return obj.subcategories.count()


# ==================== Color & Material Serializers ====================
class AdminColorSerializer(serializers.ModelSerializer):
    variant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code', 'is_active', 'variant_count', 'created_at']
    
    def get_variant_count(self, obj):
        return obj.variants.count()


class AdminMaterialSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = ['id', 'name', 'description', 'is_active', 'product_count', 'created_at']
    
    def get_product_count(self, obj):
        return obj.products.count()


# ==================== Product Serializers ====================
class AdminProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'sort_order', 'is_active']


class AdminProductVariantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantImage
        fields = ['id', 'image', 'alt_text', 'sort_order', 'is_active']


class AdminProductVariantSerializer(serializers.ModelSerializer):
    color = AdminColorSerializer(read_only=True)
    color_id = serializers.IntegerField()
    images = AdminProductVariantImageSerializer(many=True, required=False)
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'title', 'color', 'color_id', 'size', 'pattern',
            'price', 'old_price', 'stock_quantity', 'is_in_stock',
            'image', 'images', 'is_active', 'created_at', 'updated_at'
        ]


class AdminProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'sort_order', 'is_active']


class AdminProductFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeature
        fields = ['id', 'feature', 'sort_order', 'is_active']


class AdminProductOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOffer
        fields = [
            'id', 'title', 'description', 'discount_percentage',
            'discount_amount', 'is_active', 'valid_from', 'valid_until'
        ]


class AdminProductRecommendationSerializer(serializers.ModelSerializer):
    recommended_product_title = serializers.CharField(source='recommended_product.title', read_only=True)
    recommended_product_id = serializers.IntegerField(read_only=False)
    
    class Meta:
        model = ProductRecommendation
        fields = [
            'id', 'recommended_product_id', 'recommended_product_title',
            'recommendation_type', 'sort_order', 'is_active', 'created_at'
        ]
    
    def to_representation(self, instance):
        """Ensure recommended_product_id is included in the output"""
        data = super().to_representation(instance)
        # Django automatically provides recommended_product_id for ForeignKey fields
        # Make sure it's in the output
        if 'recommended_product_id' not in data or data['recommended_product_id'] is None:
            data['recommended_product_id'] = getattr(instance, 'recommended_product_id', None) or (instance.recommended_product.id if instance.recommended_product else None)
        return data


class AdminProductListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField(read_only=True)
    subcategory = serializers.StringRelatedField(read_only=True)
    variant_count = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    order_count = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'main_image', 'category', 'subcategory', 'price', 'old_price',
            'is_on_sale', 'discount_percentage', 'is_featured', 'is_active',
            'variant_count', 'total_stock', 'order_count', 'variants', 'created_at', 'updated_at'
        ]
    
    def get_variant_count(self, obj):
        return obj.variants.count()
    
    def get_total_stock(self, obj):
        return sum(v.stock_quantity for v in obj.variants.all())
    
    def get_order_count(self, obj):
        return OrderItem.objects.filter(product=obj).aggregate(
            count=Count('id')
        )['count'] or 0
    
    def get_variants(self, obj):
        """Return basic variant info for display"""
        variants = obj.variants.filter(is_active=True)[:5]  # Limit to 5 variants for list view
        return [{
            'id': v.id,
            'title': v.title,
            'color': {
                'id': v.color.id,
                'name': v.color.name,
                'hex_code': v.color.hex_code
            },
            'size': v.size,
            'pattern': v.pattern,
            'price': float(v.price) if v.price else None,
            'stock_quantity': v.stock_quantity,
            'is_in_stock': v.is_in_stock,
            'image': v.image
        } for v in variants]


class AdminProductDetailSerializer(serializers.ModelSerializer):
    category = AdminCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    subcategory = AdminSubcategorySerializer(read_only=True, allow_null=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    material = AdminMaterialSerializer(read_only=True, allow_null=True)
    material_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    images = AdminProductImageSerializer(many=True, required=False)
    variants = AdminProductVariantSerializer(many=True, required=False)
    specifications = AdminProductSpecificationSerializer(many=True, required=False)
    features = AdminProductFeatureSerializer(many=True, required=False)
    offers = AdminProductOfferSerializer(many=True, required=False)
    recommendations = AdminProductRecommendationSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'short_description', 'long_description',
            'main_image', 'category', 'category_id', 'subcategory', 'subcategory_id',
            'price', 'old_price', 'is_on_sale', 'discount_percentage',
            'brand', 'material', 'material_id', 'dimensions', 'weight', 'warranty',
            'assembly_required', 'screen_offer', 'user_guide', 'care_instructions',
            'meta_title', 'meta_description',
            'is_featured', 'is_active', 'images', 'variants', 'specifications',
            'features', 'offers', 'recommendations', 'average_rating', 'review_count',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        variants_data = validated_data.pop('variants', [])
        specifications_data = validated_data.pop('specifications', [])
        features_data = validated_data.pop('features', [])
        offers_data = validated_data.pop('offers', [])
        recommendations_data = validated_data.pop('recommendations', [])
        
        category_id = validated_data.pop('category_id')
        subcategory_id = validated_data.pop('subcategory_id', None)
        material_id = validated_data.pop('material_id', None)
        
        product = Product.objects.create(
            category_id=category_id,
            subcategory_id=subcategory_id,
            material_id=material_id,
            **validated_data
        )
        
        # Create images
        for image_data in images_data:
            ProductImage.objects.create(product=product, **image_data)
        
        # Create variants with images
        for variant_data in variants_data:
            variant_images = variant_data.pop('images', [])
            color_id = variant_data.pop('color_id')
            variant = ProductVariant.objects.create(
                product=product,
                color_id=color_id,
                **variant_data
            )
            for variant_img_data in variant_images:
                ProductVariantImage.objects.create(variant=variant, **variant_img_data)
        
        # Create specifications
        for spec_data in specifications_data:
            ProductSpecification.objects.create(product=product, **spec_data)
        
        # Create recommendations
        for rec_data in recommendations_data:
            recommended_product_id = rec_data.pop('recommended_product_id')
            ProductRecommendation.objects.create(
                product=product,
                recommended_product_id=recommended_product_id,
                **rec_data
            )
        
        # Create features
        for feature_data in features_data:
            ProductFeature.objects.create(product=product, **feature_data)
        
        # Create offers
        for offer_data in offers_data:
            ProductOffer.objects.create(product=product, **offer_data)
        
        return product
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        variants_data = validated_data.pop('variants', None)
        specifications_data = validated_data.pop('specifications', None)
        features_data = validated_data.pop('features', None)
        offers_data = validated_data.pop('offers', None)
        recommendations_data = validated_data.pop('recommendations', None)
        
        category_id = validated_data.pop('category_id', None)
        subcategory_id = validated_data.pop('subcategory_id', None)
        material_id = validated_data.pop('material_id', None)
        
        if category_id:
            instance.category_id = category_id
        if subcategory_id is not None:
            instance.subcategory_id = subcategory_id
        if material_id is not None:
            instance.material_id = material_id
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update images if provided
        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                ProductImage.objects.create(product=instance, **image_data)
        
        # Update variants if provided
        if variants_data is not None:
            # Keep existing variant IDs if provided, delete others
            existing_variant_ids = [v.get('id') for v in variants_data if v.get('id')]
            if existing_variant_ids:
                instance.variants.exclude(id__in=existing_variant_ids).delete()
            else:
                # If no IDs provided, delete all and recreate
                instance.variants.all().delete()
            
            for variant_data in variants_data:
                # Check if images key exists (not just pop default)
                variant_images = variant_data.pop('images') if 'images' in variant_data else None
                variant_id = variant_data.pop('id', None)
                color_id = variant_data.pop('color_id', None)
                
                if variant_id:
                    try:
                        variant = ProductVariant.objects.get(id=variant_id, product=instance)
                        for attr, value in variant_data.items():
                            setattr(variant, attr, value)
                        if color_id is not None:
                            variant.color_id = color_id
                        variant.save()
                        
                        # Update variant images only if provided (empty list means delete all)
                        if variant_images is not None:
                            variant.images.all().delete()
                            # Only create images if list is not empty
                            if variant_images:
                                for variant_img_data in variant_images:
                                    ProductVariantImage.objects.create(variant=variant, **variant_img_data)
                    except ProductVariant.DoesNotExist:
                        # If variant doesn't exist, create new one
                        if color_id is None:
                            raise serializers.ValidationError({'variants': 'color_id is required for new variants'})
                        variant = ProductVariant.objects.create(
                            product=instance,
                            color_id=color_id,
                            **variant_data
                        )
                        if variant_images:
                            for variant_img_data in variant_images:
                                ProductVariantImage.objects.create(variant=variant, **variant_img_data)
                else:
                    # New variant without ID
                    if color_id is None:
                        raise serializers.ValidationError({'variants': 'color_id is required for new variants'})
                    variant = ProductVariant.objects.create(
                        product=instance,
                        color_id=color_id,
                        **variant_data
                    )
                    if variant_images:
                        for variant_img_data in variant_images:
                            ProductVariantImage.objects.create(variant=variant, **variant_img_data)
        
        # Update specifications if provided
        if specifications_data is not None:
            instance.specifications.all().delete()
            for spec_data in specifications_data:
                ProductSpecification.objects.create(product=instance, **spec_data)
        
        # Update features if provided
        if features_data is not None:
            instance.features.all().delete()
            for feature_data in features_data:
                ProductFeature.objects.create(product=instance, **feature_data)
        
        # Update offers if provided
        if offers_data is not None:
            instance.offers.all().delete()
            for offer_data in offers_data:
                ProductOffer.objects.create(product=instance, **offer_data)
        
        # Update recommendations if provided
        if recommendations_data is not None:
            # Keep existing recommendation IDs if provided, delete others
            existing_rec_ids = [r.get('id') for r in recommendations_data if r.get('id')]
            if existing_rec_ids:
                instance.recommendations.exclude(id__in=existing_rec_ids).delete()
            else:
                # If no IDs provided, delete all and recreate
                instance.recommendations.all().delete()
            
            for rec_data in recommendations_data:
                recommended_product_id = rec_data.pop('recommended_product_id')
                rec_id = rec_data.pop('id', None)
                
                if rec_id:
                    try:
                        rec = ProductRecommendation.objects.get(id=rec_id, product=instance)
                        for attr, value in rec_data.items():
                            setattr(rec, attr, value)
                        rec.recommended_product_id = recommended_product_id
                        rec.save()
                    except ProductRecommendation.DoesNotExist:
                        # If recommendation doesn't exist, create new one
                        ProductRecommendation.objects.create(
                            product=instance,
                            recommended_product_id=recommended_product_id,
                            **rec_data
                        )
                else:
                    # New recommendation without ID
                    ProductRecommendation.objects.create(
                        product=instance,
                        recommended_product_id=recommended_product_id,
                        **rec_data
                    )
        
        return instance


# ==================== Order Serializers ====================
class AdminOrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    product_id = serializers.IntegerField(read_only=True)
    variant_info = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_id', 'variant', 'variant_color',
            'variant_size', 'variant_pattern', 'quantity', 'price', 'total_price', 'variant_info'
        ]
    
    def get_product(self, obj):
        if obj.product:
            # Handle main_image - it might be a string (URL) or a file field
            main_image = None
            if obj.product.main_image:
                if isinstance(obj.product.main_image, str):
                    # It's already a URL string
                    main_image = obj.product.main_image
                elif hasattr(obj.product.main_image, 'url'):
                    # It's a file field
                    main_image = obj.product.main_image.url
                else:
                    # Try to get the URL from the field
                    try:
                        main_image = obj.product.main_image.url
                    except (AttributeError, ValueError):
                        main_image = str(obj.product.main_image) if obj.product.main_image else None
            
            return {
                'id': obj.product.id,
                'title': obj.product.title,
                'slug': obj.product.slug,
                'main_image': main_image
            }
        return None
    
    def get_variant_info(self, obj):
        if obj.variant:
            color = obj.variant.color.name if obj.variant.color else ''
            size = obj.variant.size or ''
            pattern = obj.variant.pattern or ''
            parts = [p for p in [color, size, pattern] if p]
            return ' - '.join(parts) if parts else ''
        parts = [p for p in [obj.variant_color, obj.variant_size, obj.variant_pattern] if p]
        return ' - '.join(parts) if parts else ''


class AdminOrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    items_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer_name', 'customer_email', 'status',
            'payment_status', 'payment_method', 'total_amount', 'items_count',
            'created_at', 'estimated_delivery'
        ]
    
    def get_customer_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_customer_email(self, obj):
        return obj.user.email


class AdminOrderDetailSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()  # Keep for backward compatibility
    items = AdminOrderItemSerializer(many=True, read_only=True)
    order_number = serializers.CharField(source='order_id', read_only=True)
    shipping_address = serializers.SerializerMethodField()
    billing_address = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    items_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'order_number', 'user', 'customer', 'status', 'payment_status', 'payment_method',
            'subtotal', 'coupon', 'coupon_discount', 'shipping_cost', 'platform_fee', 'tax_amount', 'total_amount',
            'shipping_address', 'billing_address', 'tracking_number', 'estimated_delivery', 'delivered_at',
            'order_notes', 'items', 'items_count', 'status_history', 'notes',
            'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature',
            'created_at', 'updated_at'
        ]
    
    def to_representation(self, instance):
        """Add computed fields for backward compatibility"""
        data = super().to_representation(instance)
        # Add 'tax' as alias for 'tax_amount' for frontend compatibility
        data['tax'] = data.get('tax_amount', 0)
        # Add 'total' as alias for 'total_amount' for frontend compatibility
        data['total'] = data.get('total_amount', 0)
        # Include coupon information
        if instance.coupon:
            data['coupon'] = {
                'id': instance.coupon.id,
                'code': instance.coupon.code,
                'discount_type': instance.coupon.discount_type,
                'discount_value': str(instance.coupon.discount_value),
            }
        else:
            data['coupon'] = None
        # Use coupon_discount from model, fallback to calculated if not present
        coupon_discount = float(data.get('coupon_discount', 0))
        if coupon_discount == 0:
            # Calculate discount if needed (subtotal + tax + platform_fee + shipping - total_amount)
            subtotal = float(data.get('subtotal', 0))
            tax = float(data.get('tax_amount', 0))
            platform_fee = float(data.get('platform_fee', 0))
            shipping = float(data.get('shipping_cost', 0))
            total = float(data.get('total_amount', 0))
            calculated_total = subtotal + tax + platform_fee + shipping
            discount_amount = max(0, calculated_total - total)
            coupon_discount = discount_amount if discount_amount > 0 else 0
        data['coupon_discount'] = coupon_discount
        data['discount'] = coupon_discount  # For backward compatibility
        return data
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'full_name': obj.user.get_full_name(),
            'mobile': getattr(obj.user, 'mobile', None)
        }
    
    def get_customer(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name(),
            'mobile': getattr(obj.user, 'mobile', None)
        }
    
    def get_billing_address(self, obj):
        if hasattr(obj, 'billing_address') and obj.billing_address:
            addr = obj.billing_address
            return {
                'id': addr.id,
                'full_name': getattr(addr, 'full_name', ''),
                'phone': getattr(addr, 'phone', ''),
                'address_line1': getattr(addr, 'address_line1', getattr(addr, 'street_address', '')),
                'address_line2': getattr(addr, 'address_line2', ''),
                'city': addr.city,
                'state': addr.state,
                'postal_code': getattr(addr, 'postal_code', getattr(addr, 'zip_code', '')),
                'country': addr.country
            }
        return None
    
    def get_shipping_address(self, obj):
        addr = obj.shipping_address
        return {
            'id': addr.id,
            'full_name': addr.full_name,
            'phone': addr.phone,
            'address_line1': getattr(addr, 'address_line1', addr.street_address),
            'address_line2': getattr(addr, 'address_line2', ''),
            'street_address': addr.street_address,
            'city': addr.city,
            'state': addr.state,
            'postal_code': addr.postal_code,
            'country': addr.country
        }
    
    def get_status_history(self, obj):
        return [{
            'status': h.status,
            'notes': h.notes,
            'created_at': h.created_at,
            'created_by': h.created_by.username if h.created_by else None
        } for h in obj.status_history.all()]
    
    def get_notes(self, obj):
        return [{
            'id': n.id,
            'content': n.content,
            'created_at': n.created_at,
            'created_by': n.created_by.username if n.created_by else None
        } for n in obj.notes.all()]


# ==================== Discount Serializers ====================
class AdminDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'percentage', 'label', 'is_active', 'created_at']


# ==================== Payment & Charges Serializers ====================
class PaymentChargeSerializer(serializers.Serializer):
    """Serializer for payment charges configuration"""
    # Platform fees per payment method (percentage)
    platform_fee_upi = serializers.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text='Platform fee percentage for UPI payments (Razorpay: 0%)')
    platform_fee_card = serializers.DecimalField(max_digits=5, decimal_places=2, default=2.36, help_text='Platform fee percentage for Credit/Debit Card payments (Razorpay: 2.36% including GST)')
    platform_fee_netbanking = serializers.DecimalField(max_digits=5, decimal_places=2, default=2.36, help_text='Platform fee percentage for Net Banking payments (Razorpay: 2.36% including GST)')
    platform_fee_cod = serializers.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text='Platform fee percentage for COD payments (Cash on Delivery: 0%)')
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    razorpay_enabled = serializers.BooleanField()
    cod_enabled = serializers.BooleanField()


# ==================== Contact Query Serializers ====================
class AdminContactQuerySerializer(serializers.ModelSerializer):
    """Serializer for contact queries in admin panel"""
    class Meta:
        model = ContactQuery
        fields = [
            'id', 'full_name', 'pincode', 'phone_number', 'email', 'message',
            'status', 'admin_notes', 'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_at']


# ==================== Bulk Order Serializers ====================
class AdminBulkOrderSerializer(serializers.ModelSerializer):
    """Serializer for bulk orders in admin panel"""
    assigned_to_name = serializers.SerializerMethodField()
    assigned_to_email = serializers.SerializerMethodField()
    
    class Meta:
        model = BulkOrder
        fields = [
            'id', 'company_name', 'contact_person', 'email', 'phone_number',
            'address', 'city', 'state', 'pincode', 'country', 'project_type',
            'estimated_quantity', 'estimated_budget', 'delivery_date',
            'special_requirements', 'status', 'admin_notes', 'quoted_price',
            'assigned_to', 'assigned_to_name', 'assigned_to_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.email
        return None
    
    def get_assigned_to_email(self, obj):
        return obj.assigned_to.email if obj.assigned_to else None


# ==================== Admin Log Serializers ====================
class AdminLogSerializer(serializers.ModelSerializer):
    """Serializer for admin logs"""
    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminLog
        fields = [
            'id', 'user', 'user_email', 'user_name', 'action_type',
            'model_name', 'object_id', 'object_repr', 'details',
            'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return None


# ==================== Coupon Serializers ====================
class AdminCouponSerializer(serializers.ModelSerializer):
    is_valid_now = serializers.SerializerMethodField()
    remaining_uses = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_order_amount', 'max_discount_amount', 'valid_from', 'valid_until',
            'is_active', 'usage_limit', 'used_count', 'one_time_use_per_user',
            'is_valid_now', 'remaining_uses', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'used_count']
    
    def get_is_valid_now(self, obj):
        return obj.is_valid()
    
    def get_remaining_uses(self, obj):
        if obj.usage_limit:
            return obj.usage_limit - obj.used_count
        return None


# ==================== Home Page Content Serializers ====================
class HomePageContentSerializer(serializers.ModelSerializer):
    """Serializer for home page content sections"""
    class Meta:
        model = HomePageContent
        fields = [
            'id', 'section_key', 'section_name', 'content',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_content(self, value):
        """Validate that content is a dict"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Content must be a JSON object")
        return value


class BulkOrderPageContentSerializer(serializers.ModelSerializer):
    """Serializer for bulk order page content sections"""
    class Meta:
        model = BulkOrderPageContent
        fields = [
            'id', 'section_key', 'section_name', 'content',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_content(self, value):
        """Validate that content is a dict"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Content must be a JSON object")
        return value


class AdminDataRequestSerializer(serializers.ModelSerializer):
    """Serializer for data requests in admin panel"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True, allow_null=True)
    
    class Meta:
        model = DataRequest
        fields = [
            'id', 'user', 'user_email', 'user_name', 'request_type', 'request_type_display',
            'status', 'status_display', 'file_path', 'requested_at', 'approved_at',
            'approved_by', 'approved_by_email', 'completed_at', 'admin_notes'
        ]
        read_only_fields = ['id', 'requested_at', 'approved_at', 'approved_by', 'completed_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email

