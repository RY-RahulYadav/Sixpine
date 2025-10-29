from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
import razorpay
import hmac
import hashlib
from .models import Address, Order, OrderStatusHistory
from .serializers import (
    AddressSerializer, OrderListSerializer, OrderDetailSerializer, 
    OrderCreateSerializer
)

# Initialize Razorpay client
razorpay_key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
razorpay_key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

# Initialize Razorpay client only if keys are provided
if razorpay_key_id and razorpay_key_secret:
    razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
else:
    razorpay_client = None


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
    
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            error_message = str(e)
            if 'protected' in error_message.lower() or 'referenced' in error_message.lower():
                return Response(
                    {'error': 'Cannot delete this address because it is associated with an existing order. Please set a different address as default instead.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {'error': 'Failed to delete address. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class OrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('shipping_address').prefetch_related(
            'items__product', 'items__variant__color'
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_id'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items__product', 'items__variant__color', 'status_history'
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
    
    # Restore variant stock
    for item in order.items.all():
        if item.variant:
            item.variant.stock_quantity += item.quantity
            item.variant.is_in_stock = item.variant.stock_quantity > 0
            item.variant.save()
    
    return Response({'message': 'Order cancelled successfully'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_razorpay_order(request):
    """Create a Razorpay order for payment"""
    from cart.models import Cart
    
    # Check if Razorpay is configured
    if not razorpay_client:
        return Response(
            {'error': 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    amount = request.data.get('amount')  # Amount in rupees
    shipping_address_id = request.data.get('shipping_address_id')
    
    # Validate required fields
    if amount is None or amount == '':
        return Response(
            {'error': 'Amount is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if shipping_address_id is None or shipping_address_id == '':
        return Response(
            {'error': 'Shipping address ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Convert amount to float and validate
        amount_float = float(amount)
        if amount_float <= 0:
            return Response(
                {'error': 'Amount must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert amount to paise (Razorpay requires amount in smallest currency unit)
        amount_in_paise = int(amount_float * 100)
        
        # Verify address belongs to user
        try:
            address = Address.objects.get(id=shipping_address_id, user=request.user)
        except Address.DoesNotExist:
            return Response(
                {'error': 'Invalid shipping address'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            'amount': amount_in_paise,
            'currency': 'INR',
            'receipt': f'order_{request.user.id}_{shipping_address_id}',
            'notes': {
                'user_id': request.user.id,
                'shipping_address_id': shipping_address_id
            }
        })
        
        razorpay_key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        
        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'amount': amount_float,  # Amount in rupees (frontend will convert to paise)
            'currency': 'INR',
            'key': razorpay_key_id
        }, status=status.HTTP_200_OK)
        
    except ValueError:
        return Response(
            {'error': 'Invalid amount format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except razorpay.errors.BadRequestError as e:
        error_msg = str(e)
        return Response(
            {'error': f'Razorpay error: {error_msg}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to create Razorpay order: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_razorpay_payment(request):
    """Verify Razorpay payment and create order"""
    from cart.models import Cart
    from decimal import Decimal
    
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_signature = request.data.get('razorpay_signature')
    shipping_address_id = request.data.get('shipping_address_id')
    payment_method = request.data.get('payment_method', 'RAZORPAY')
    
    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, shipping_address_id]):
        return Response({'error': 'Missing required payment parameters'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Verify payment signature
    try:
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
    except razorpay.SignatureVerificationError:
        # Payment verification failed - create pending order for user to complete payment later
        address = get_object_or_404(Address, id=shipping_address_id, user=request.user)
        
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        subtotal = Decimal('0.00')
        for cart_item in cart.items.all():
            price = cart_item.product.price
            if cart_item.variant and cart_item.variant.price:
                price = cart_item.variant.price
            subtotal += price * cart_item.quantity
        
        tax_amount = subtotal * Decimal('0.05')
        shipping_cost = Decimal('50.00') if subtotal < Decimal('500.00') else Decimal('0.00')
        total_amount = subtotal + tax_amount + shipping_cost
        
        # Create pending order with payment_status='pending'
        order = Order.objects.create(
            user=request.user,
            shipping_address=address,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax_amount=tax_amount,
            total_amount=total_amount,
            payment_method=payment_method,
            razorpay_order_id=razorpay_order_id,
            payment_status='pending',
            status='pending'
        )
        
        # Create order items
        for cart_item in cart.items.all():
            from orders.models import OrderItem
            from products.models import ProductVariant
            
            # Get price from variant if available, otherwise from product
            price = cart_item.product.price
            if cart_item.variant and cart_item.variant.price:
                price = cart_item.variant.price
            
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                variant=cart_item.variant,
                quantity=cart_item.quantity,
                price=price,
                variant_color=cart_item.variant.color.name if cart_item.variant else '',
                variant_size=cart_item.variant.size if cart_item.variant else '',
                variant_pattern=cart_item.variant.pattern if cart_item.variant else ''
            )
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            notes='Order created but payment verification failed. User needs to complete payment.',
            created_by=request.user
        )
        
        # Clear cart even if payment failed (order is created)
        cart.items.all().delete()
        
        return Response({
            'error': 'Payment signature verification failed. Order created with pending payment status.',
            'order_id': str(order.order_id)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify address belongs to user
    address = get_object_or_404(Address, id=shipping_address_id, user=request.user)
    
    # Get cart
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
    
    # Calculate totals
    subtotal = Decimal('0.00')
    for cart_item in cart.items.all():
        subtotal += cart_item.product.price * cart_item.quantity
    
    # Simple tax and shipping calculation
    tax_amount = subtotal * Decimal('0.05')  # 5% Tax
    shipping_cost = Decimal('50.00') if subtotal < Decimal('500.00') else Decimal('0.00')
    total_amount = subtotal + tax_amount + shipping_cost
    
    # Create order
    order = Order.objects.create(
        user=request.user,
        shipping_address=address,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_method=payment_method,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_signature=razorpay_signature,
        payment_status='paid',
        status='confirmed'
    )
    
    # Create order items
    for cart_item in cart.items.all():
        from orders.models import OrderItem
        from products.models import ProductVariant
        
        # Get price from variant if available, otherwise from product
        price = cart_item.product.price
        if cart_item.variant and cart_item.variant.price:
            price = cart_item.variant.price
        
        # Create order item with variant information
        OrderItem.objects.create(
            order=order,
            product=cart_item.product,
            variant=cart_item.variant,
            quantity=cart_item.quantity,
            price=price,
            variant_color=cart_item.variant.color.name if cart_item.variant else '',
            variant_size=cart_item.variant.size if cart_item.variant else '',
            variant_pattern=cart_item.variant.pattern if cart_item.variant else ''
        )
        
        # Update variant stock if variant exists
        if cart_item.variant:
            cart_item.variant.stock_quantity -= cart_item.quantity
            cart_item.variant.is_in_stock = cart_item.variant.stock_quantity > 0
            cart_item.variant.save()
    
    # Create initial status history
    OrderStatusHistory.objects.create(
        order=order,
        status='confirmed',
        notes='Order created and payment verified',
        created_by=request.user
    )
    
    # Clear cart
    cart.items.all().delete()
    
    # Return order details
    from .serializers import OrderDetailSerializer
    return Response({
        'message': 'Order created successfully',
        'order': OrderDetailSerializer(order, context={'request': request}).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_payment(request):
    """Complete payment for a pending order"""
    from decimal import Decimal
    
    order_id = request.data.get('order_id')
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_signature = request.data.get('razorpay_signature')
    payment_method = request.data.get('payment_method', 'RAZORPAY')
    
    if not order_id:
        return Response({'error': 'Order ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get order
    try:
        order = Order.objects.get(order_id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if order is pending payment
    if order.payment_status != 'pending':
        return Response({'error': 'Order payment is already completed or cannot be completed'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Verify payment signature if Razorpay
    if payment_method in ['RAZORPAY', 'CARD', 'NET_BANKING', 'UPI', 'WALLET']:
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({'error': 'Missing required payment parameters'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            razorpay_client.utility.verify_payment_signature(params_dict)
        except razorpay.SignatureVerificationError:
            return Response({'error': 'Payment signature verification failed'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update order with payment details
        order.razorpay_order_id = razorpay_order_id
        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
    
    # Update order status
    order.payment_method = payment_method
    order.payment_status = 'paid'
    order.status = 'confirmed'
    order.save()
    
    # Update variant stock (if not already done and variant exists)
    if order.items.exists():
        for order_item in order.items.all():
            if order_item.variant:
                if order_item.variant.stock_quantity >= order_item.quantity:
                    order_item.variant.stock_quantity -= order_item.quantity
                    order_item.variant.is_in_stock = order_item.variant.stock_quantity > 0
                    order_item.variant.save()
    
    # Create status history
    OrderStatusHistory.objects.create(
        order=order,
        status='confirmed',
        notes='Payment completed successfully. Order confirmed.',
        created_by=request.user
    )
    
    # Return order details
    from .serializers import OrderDetailSerializer
    return Response({
        'message': 'Payment completed successfully. Order confirmed.',
        'order': OrderDetailSerializer(order, context={'request': request}).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def checkout_with_cod(request):
    """Checkout with Cash on Delivery"""
    from cart.models import Cart
    from decimal import Decimal
    
    shipping_address_id = request.data.get('shipping_address_id')
    order_notes = request.data.get('order_notes', '')
    
    if not shipping_address_id:
        return Response({'error': 'Shipping address is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Verify address
    address = get_object_or_404(Address, id=shipping_address_id, user=request.user)
    
    # Get cart
    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate totals
    subtotal = Decimal('0.00')
    for cart_item in cart.items.all():
        subtotal += cart_item.product.price * cart_item.quantity
    
    # Simple tax and shipping calculation
    tax_amount = subtotal * Decimal('0.05')  # 5% Tax
    shipping_cost = Decimal('50.00') if subtotal < Decimal('500.00') else Decimal('0.00')
    total_amount = subtotal + tax_amount + shipping_cost
    
    # Create order
    order = Order.objects.create(
        user=request.user,
        shipping_address=address,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_method='COD',
        payment_status='pending',
        status='pending',
        order_notes=order_notes
    )
    
    # Create order items
    for cart_item in cart.items.all():
        from orders.models import OrderItem
        from products.models import ProductVariant
        
        # Get price from variant if available, otherwise from product
        price = cart_item.product.price
        if cart_item.variant and cart_item.variant.price:
            price = cart_item.variant.price
        
        # Create order item with variant information
        OrderItem.objects.create(
            order=order,
            product=cart_item.product,
            variant=cart_item.variant,
            quantity=cart_item.quantity,
            price=price,
            variant_color=cart_item.variant.color.name if cart_item.variant else '',
            variant_size=cart_item.variant.size if cart_item.variant else '',
            variant_pattern=cart_item.variant.pattern if cart_item.variant else ''
        )
        
        # Update variant stock if variant exists
        if cart_item.variant:
            cart_item.variant.stock_quantity -= cart_item.quantity
            cart_item.variant.is_in_stock = cart_item.variant.stock_quantity > 0
            cart_item.variant.save()
    
    # Create initial status history
    OrderStatusHistory.objects.create(
        order=order,
        status='pending',
        notes='Order created with COD payment',
        created_by=request.user
    )
    
    # Clear cart
    cart.items.all().delete()
    
    # Return order details
    from .serializers import OrderDetailSerializer
    return Response({
        'message': 'Order created successfully',
        'order': OrderDetailSerializer(order, context={'request': request}).data
    }, status=status.HTTP_201_CREATED)
