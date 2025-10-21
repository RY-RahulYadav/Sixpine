from rest_framework import serializers
from products.models import Product, Category, Brand, ProductImage, ProductVariant
from orders.models import Order, OrderItem, OrderStatusHistory, Address
from cart.models import Cart, CartItem
from accounts.models import User
from .models import AdminLog, AdminDashboardSetting


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_active', 'is_staff', 'date_joined', 'last_login']


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer for admin"""
    profile = serializers.SerializerMethodField()
    order_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_active', 'is_staff', 'date_joined', 'last_login',
                  'profile', 'order_count', 'total_spent']

    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            return {
                'phone': obj.profile.phone,
                'date_of_birth': obj.profile.date_of_birth,
                'gender': obj.profile.get_gender_display() if obj.profile.gender else None,
                'avatar': obj.profile.avatar.url if obj.profile.avatar else None,
                'newsletter_subscription': obj.profile.newsletter_subscription
            }
        return None

    def get_order_count(self, obj):
        return obj.orders.count()
    
    def get_total_spent(self, obj):
        return sum(order.total_amount for order in obj.orders.all())


class AdminProductSerializer(serializers.ModelSerializer):
    """Product serializer for admin"""
    category_name = serializers.ReadOnlyField(source='category.name')
    brand_name = serializers.ReadOnlyField(source='brand.name')
    main_image_url = serializers.SerializerMethodField()
    variant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'title', 'slug', 'price', 'old_price', 'stock_quantity', 
                  'sku', 'is_active', 'is_featured', 'category', 'category_name',
                  'brand', 'brand_name', 'created_at', 'updated_at', 
                  'main_image_url', 'variant_count']
    
    def get_main_image_url(self, obj):
        main_img = obj.images.filter(is_main=True).first()
        if main_img and main_img.image:
            return main_img.image  # Already a URL string
        return None
    
    def get_variant_count(self, obj):
        return obj.variants.count()


class AdminProductVariantSerializer(serializers.ModelSerializer):
    """Serializer for product variants in admin"""
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'name', 'price', 'old_price', 'stock_quantity', 'attributes', 'is_active']


class AdminProductDetailSerializer(serializers.ModelSerializer):
    """Detailed product serializer for admin"""
    category_name = serializers.ReadOnlyField(source='category.name')
    brand_name = serializers.ReadOnlyField(source='brand.name') 
    images = serializers.SerializerMethodField()
    variants = AdminProductVariantSerializer(many=True, required=False)
    attributes = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    order_count = serializers.SerializerMethodField()
    
    # Make category accept ID for create/update
    category_id = serializers.IntegerField(write_only=True, required=False)
    brand_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_images(self, obj):
        request = self.context.get('request')
        return [{
            'id': img.id,
            'url': img.image,  # Direct URL string, no need for .url attribute
            'image_url': img.image,  # Direct URL string, no need for .url attribute
            'alt_text': img.alt_text,
            'is_main': img.is_main,
            'is_primary': img.is_main,
            'order': img.order
        } for img in obj.images.all()]
    
    def get_attributes(self, obj):
        return [{
            'id': attr.id,
            'name': attr.filter_attribute.name if attr.filter_attribute else None,
            'value': attr.value
        } for attr in obj.attributes.all()]
    
    def get_review_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()
    
    def get_average_rating(self, obj):
        return obj.average_rating
    
    def get_avg_rating(self, obj):
        return obj.average_rating
    
    def get_order_count(self, obj):
        from orders.models import OrderItem
        return OrderItem.objects.filter(product=obj).count()
    
    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        category_id = validated_data.pop('category_id', None)
        brand_id = validated_data.pop('brand_id', None)
        
        if category_id:
            validated_data['category_id'] = category_id
        if brand_id:
            validated_data['brand_id'] = brand_id
        
        product = Product.objects.create(**validated_data)
        
        # Create variants if provided
        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product
    
    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        category_id = validated_data.pop('category_id', None)
        brand_id = validated_data.pop('brand_id', None)
        
        if category_id:
            validated_data['category_id'] = category_id
        if brand_id is not None:
            validated_data['brand_id'] = brand_id
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update variants if provided
        if variants_data is not None:
            # Get existing variant IDs
            existing_variant_ids = set(instance.variants.values_list('id', flat=True))
            updated_variant_ids = set()
            
            for variant_data in variants_data:
                variant_id = variant_data.get('id')
                if variant_id and variant_id in existing_variant_ids:
                    # Update existing variant
                    variant = ProductVariant.objects.get(id=variant_id)
                    for attr, value in variant_data.items():
                        setattr(variant, attr, value)
                    variant.save()
                    updated_variant_ids.add(variant_id)
                else:
                    # Create new variant
                    variant_data.pop('id', None)  # Remove id if present
                    variant = ProductVariant.objects.create(product=instance, **variant_data)
                    updated_variant_ids.add(variant.id)
            
            # Delete variants that were not in the update
            variants_to_delete = existing_variant_ids - updated_variant_ids
            ProductVariant.objects.filter(id__in=variants_to_delete).delete()
        
        return instance


class AdminOrderSerializer(serializers.ModelSerializer):
    """Order serializer for admin"""
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    items_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Order
        fields = ['id', 'order_id', 'user', 'customer_name', 'customer_email', 'status', 'payment_status',
                  'subtotal', 'shipping_cost', 'tax_amount', 'total_amount', 'items_count', 'created_at']
    
    def get_customer_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else obj.user.username
    
    def get_customer_email(self, obj):
        return obj.user.email


class AdminOrderDetailSerializer(serializers.ModelSerializer):
    """Detailed order serializer for admin"""
    customer = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()
    shipping_address = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
    
    def get_customer(self, obj):
        user = obj.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name or 'N/A',
            'last_name': user.last_name or 'N/A',
            'full_name': full_name if full_name else user.username,
            'phone': user.profile.phone if hasattr(user, 'profile') else 'N/A',
            'is_active': user.is_active
        }
    
    def get_items(self, obj):
        return [{
            'id': item.id,
            'product_id': item.product.id,
            'product': {
                'id': item.product.id,
                'title': item.product.title,
                'sku': item.product.sku,
                'main_image_url': item.product.main_image,
                'slug': item.product.slug
            },
            'price': item.price,
            'quantity': item.quantity,
            'total_price': item.total_price
        } for item in obj.items.all()]
    
    def get_shipping_address(self, obj):
        addr = obj.shipping_address
        if addr:
            return {
                'id': addr.id,
                'full_name': addr.full_name,
                'phone': addr.phone,
                'address_line1': addr.street_address,  # Map to frontend expected format
                'address_line2': '',  # Not in our model
                'street_address': addr.street_address,
                'city': addr.city,
                'state': addr.state,
                'postal_code': addr.postal_code,
                'country': addr.country,
                'type': addr.type
            }
        return None
    
    def get_status_history(self, obj):
        return [{
            'id': history.id,
            'status': history.status,
            'notes': history.notes,
            'created_at': history.created_at,
            'created_by': history.created_by.username if history.created_by else None
        } for history in obj.status_history.all().order_by('-created_at')]


class AdminCategorySerializer(serializers.ModelSerializer):
    """Category serializer for admin"""
    product_count = serializers.SerializerMethodField()
    subcategories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'is_active', 
                  'product_count', 'subcategories_count', 'sort_order']
    
    def get_product_count(self, obj):
        return obj.products.count()
    
    def get_subcategories_count(self, obj):
        return obj.subcategories.count()


class AdminDashboardStatsSerializer(serializers.Serializer):
    """Serializer for admin dashboard statistics"""
    total_users = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_products = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    low_stock_products = serializers.IntegerField()
    recent_orders = AdminOrderSerializer(many=True)
    top_selling_products = serializers.ListField()
    sales_by_day = serializers.ListField()


class AdminLogSerializer(serializers.ModelSerializer):
    """Serializer for admin action logs"""
    user_username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = AdminLog
        fields = ['id', 'user', 'user_username', 'action', 'model_name', 
                  'object_id', 'details', 'ip_address', 'created_at']