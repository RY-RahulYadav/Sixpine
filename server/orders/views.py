from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Address, Order, OrderStatusHistory
from .serializers import (
    AddressSerializer, OrderListSerializer, OrderDetailSerializer, 
    OrderCreateSerializer
)


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('shipping_address')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_id'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items__product', 'status_history'
        ).select_related('shipping_address')


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        order = serializer.save(user=self.request.user)
        
        # Create initial status history
        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            notes='Order created',
            created_by=self.request.user
        )
        
        # Clear user's cart after successful order
        from cart.models import Cart
        try:
            cart = Cart.objects.get(user=self.request.user)
            cart.items.all().delete()
        except Cart.DoesNotExist:
            pass


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def checkout_from_cart(request):
    """Create order from user's cart"""
    from cart.models import Cart
    
    shipping_address_id = request.data.get('shipping_address_id')
    order_notes = request.data.get('order_notes', '')
    
    if not shipping_address_id:
        return Response({'error': 'Shipping address is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify shipping address belongs to user
    address = get_object_or_404(Address, id=shipping_address_id, user=request.user)
    
    # Get user's cart
    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Prepare items data
    items_data = []
    for cart_item in cart.items.all():
        items_data.append({
            'product_id': cart_item.product.id,
            'quantity': cart_item.quantity
        })
    
    # Create order
    order_data = {
        'shipping_address_id': shipping_address_id,
        'items': items_data,
        'order_notes': order_notes
    }
    
    serializer = OrderCreateSerializer(data=order_data, context={'request': request})
    if serializer.is_valid():
        order = serializer.save()
        
        # Create initial status history
        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            notes='Order created from cart',
            created_by=request.user
        )
        
        # Clear cart
        cart.items.all().delete()
        
        return Response({
            'message': 'Order created successfully',
            'order': OrderDetailSerializer(order, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, order_id):
    """Cancel an order"""
    order = get_object_or_404(Order, order_id=order_id, user=request.user)
    
    if order.status not in ['pending', 'confirmed']:
        return Response({
            'error': 'Order cannot be cancelled at this stage'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = 'cancelled'
    order.save()
    
    # Create status history
    OrderStatusHistory.objects.create(
        order=order,
        status='cancelled',
        notes='Order cancelled by customer',
        created_by=request.user
    )
    
    # Restore product stock
    for item in order.items.all():
        item.product.stock_quantity += item.quantity
        item.product.save()
    
    return Response({'message': 'Order cancelled successfully'})
