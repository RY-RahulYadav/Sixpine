from rest_framework import serializers
from .models import Address, Order, OrderItem, OrderStatusHistory, OrderNote
from products.serializers import ProductListSerializer


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'type', 'full_name', 'phone', 'street_address', 'city', 'state', 
                 'postal_code', 'country', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'total_price', 'created_at']
        read_only_fields = ['price', 'total_price', 'created_at']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'notes', 'created_at', 'created_by']
        read_only_fields = ['created_at', 'created_by']


class OrderNoteSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = OrderNote
        fields = ['id', 'content', 'created_at', 'created_by']
        read_only_fields = ['created_at', 'created_by']
    
    def get_created_by(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username
            }
        return None


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for order list view"""
    items_count = serializers.ReadOnlyField()
    shipping_address = AddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['order_id', 'status', 'payment_status', 'total_amount', 'items_count',
                 'shipping_address', 'created_at', 'estimated_delivery']
        read_only_fields = ['order_id', 'created_at']


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order detail view"""
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    items_count = serializers.ReadOnlyField()

    class Meta:
        model = Order
        fields = ['order_id', 'user', 'status', 'payment_status', 'subtotal', 'shipping_cost',
                 'tax_amount', 'total_amount', 'shipping_address', 'tracking_number',
                 'estimated_delivery', 'delivered_at', 'order_notes', 'items', 'status_history',
                 'items_count', 'created_at', 'updated_at']
        read_only_fields = ['order_id', 'user', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    shipping_address_id = serializers.IntegerField(write_only=True)
    items = OrderItemSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = ['shipping_address_id', 'items', 'order_notes']
        
    def validate_shipping_address_id(self, value):
        user = self.context['request'].user
        if not Address.objects.filter(id=value, user=user).exists():
            raise serializers.ValidationError("Invalid shipping address")
        return value

    def create(self, validated_data):
        from products.models import Product
        from decimal import Decimal
        
        user = self.context['request'].user
        items_data = validated_data.pop('items')
        shipping_address_id = validated_data.pop('shipping_address_id')
        
        # Calculate totals
        subtotal = Decimal('0.00')
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            subtotal += product.price * item_data['quantity']
        
        # Simple tax and shipping calculation
        tax_amount = subtotal * Decimal('0.05')  # 5% Tax
        shipping_cost = Decimal('50.00') if subtotal < Decimal('500.00') else Decimal('0.00')
        total_amount = subtotal + tax_amount + shipping_cost
        
        # Create order
        order = Order.objects.create(
            user=user,
            shipping_address_id=shipping_address_id,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax_amount=tax_amount,
            total_amount=total_amount,
            **validated_data
        )
        
        # Create order items
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=product.price
            )
            # Update product stock
            product.stock_quantity -= item_data['quantity']
            product.save()
        
        return order