from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['total_price', 'created_at', 'updated_at']

    def validate(self, attrs):
        from products.models import Product
        
        if 'product_id' in attrs:
            try:
                product = Product.objects.get(id=attrs['product_id'])
                if attrs.get('quantity', 1) > product.stock_quantity:
                    raise serializers.ValidationError(
                        f"Only {product.stock_quantity} items available in stock"
                    )
            except Product.DoesNotExist:
                raise serializers.ValidationError("Product not found")
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    items_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_items', 'total_price', 'items_count', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']