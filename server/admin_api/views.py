from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .permissions import IsAdminUser
from .models import GlobalSettings
from .serializers import (
    DashboardStatsSerializer, AdminUserListSerializer, AdminUserDetailSerializer,
    AdminUserCreateSerializer, AdminUserUpdateSerializer, AdminCategorySerializer,
    AdminSubcategorySerializer, AdminColorSerializer, AdminMaterialSerializer,
    AdminProductListSerializer, AdminProductDetailSerializer,
    AdminOrderListSerializer, AdminOrderDetailSerializer, AdminDiscountSerializer,
    PaymentChargeSerializer, GlobalSettingsSerializer,
    AdminContactQuerySerializer, AdminBulkOrderSerializer, AdminLogSerializer,
    AdminCouponSerializer
)
from accounts.models import User, ContactQuery, BulkOrder
from products.models import (
    Category, Subcategory, Color, Material, Product, ProductImage,
    ProductVariant, ProductVariantImage, ProductSpecification, ProductFeature,
    ProductOffer, Discount, Coupon
)
from orders.models import Order, OrderItem, OrderStatusHistory, OrderNote
from .models import AdminLog
from .utils import create_admin_log
from .mixins import AdminLoggingMixin

User = get_user_model()


# ==================== Dashboard Views ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    """Get comprehensive dashboard statistics"""
    # Calculate date ranges
    today = timezone.now().date()
    thirty_days_ago = today - timedelta(days=30)
    
    # Basic stats
    total_users = User.objects.count()
    total_orders = Order.objects.count()
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    total_products = Product.objects.count()
    
    # Order summary stats
    orders_placed_count = Order.objects.count()
    delivered_orders_count = Order.objects.filter(status='delivered').count()
    cod_orders_count = Order.objects.filter(payment_method='COD').count()
    # Online payment = total orders - COD orders
    online_payment_orders_count = orders_placed_count - cod_orders_count
    
    # Low stock products - get global threshold, default to 100
    low_stock_threshold = GlobalSettings.get_setting('low_stock_threshold', 100)
    
    # Calculate low stock products: sum all variant stocks per product, compare to threshold
    products_with_stock = Product.objects.annotate(
        total_stock=Sum('variants__stock_quantity', filter=Q(variants__is_active=True))
    ).filter(total_stock__lt=low_stock_threshold, total_stock__isnull=False, is_active=True)
    low_stock_products = products_with_stock.count()
    
    # Recent orders (last 10)
    recent_orders = Order.objects.order_by('-created_at')[:10].values(
        'id', 'order_id', 'status', 'total_amount', 'created_at'
    )
    recent_orders = [{
        **order,
        'customer_name': Order.objects.get(id=order['id']).user.get_full_name() or Order.objects.get(id=order['id']).user.username
    } for order in recent_orders]
    
    # Top selling products with revenue calculation
    from django.db.models import F, DecimalField
    
    top_products = OrderItem.objects.values('product').annotate(
        sold=Sum('quantity'),
        revenue=Sum(F('quantity') * F('price'), output_field=DecimalField(max_digits=10, decimal_places=2))
    ).order_by('-sold')[:10]
    top_selling_products = []
    for item in top_products:
        product = Product.objects.get(id=item['product'])
        # Calculate revenue: sum of (quantity * price) for all order items of this product
        revenue = item.get('revenue') or Decimal('0.00')
        top_selling_products.append({
            'id': product.id,
            'title': product.title,
            'sold': item['sold'],
            'revenue': float(revenue)
        })
    
    # Sales by day (last 30 days)
    sales_by_day = []
    for i in range(30):
        date = thirty_days_ago + timedelta(days=i)
        day_orders = Order.objects.filter(
            created_at__date=date,
            payment_status='paid'
        )
        revenue = day_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        orders_count = day_orders.count()
        sales_by_day.append({
            'date': date.isoformat(),
            'revenue': float(revenue),
            'orders': orders_count
        })
    
    data = {
        'total_users': total_users,
        'total_orders': total_orders,
        'total_revenue': str(total_revenue),
        'total_products': total_products,
        'orders_placed_count': orders_placed_count,
        'delivered_orders_count': delivered_orders_count,
        'cod_orders_count': cod_orders_count,
        'online_payment_orders_count': online_payment_orders_count,
        'low_stock_products': low_stock_products,
        'recent_orders': list(recent_orders),
        'top_selling_products': top_selling_products,
        'sales_by_day': sales_by_day
    }
    
    serializer = DashboardStatsSerializer(data)
    return Response(serializer.data)


# ==================== User Management Views ====================
class AdminUserViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for user management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        elif self.action == 'list':
            return AdminUserListSerializer
        elif self.action == 'retrieve':
            return AdminUserDetailSerializer
        return AdminUserUpdateSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        is_active = self.request.query_params.get('is_active', None)
        is_staff = self.request.query_params.get('is_staff', None)
        
        # By default, exclude admin users (customers only)
        # Only show admin users if explicitly requested
        if is_staff is None:
            queryset = queryset.filter(is_staff=False)
        elif is_staff is not None:
            queryset = queryset.filter(is_staff=is_staff.lower() == 'true')
        
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        try:
            create_admin_log(
                request=request,
                action_type='activate' if user.is_active else 'deactivate',
                model_name='User',
                object_id=user.id,
                object_repr=str(user),
                details={'is_active': user.is_active}
            )
        except Exception as e:
            print(f"Error creating admin log: {e}")
        return Response({
            'id': user.id,
            'is_active': user.is_active,
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully'
        })
    
    @action(detail=True, methods=['post'])
    def toggle_staff(self, request, pk=None):
        """Toggle user staff status"""
        user = self.get_object()
        user.is_staff = not user.is_staff
        user.save()
        return Response({
            'id': user.id,
            'is_staff': user.is_staff,
            'message': f'Staff status {"granted" if user.is_staff else "revoked"} successfully'
        })
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password"""
        user = self.get_object()
        new_password = request.data.get('password')
        if not new_password:
            return Response(
                {'error': 'Password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successfully'})


# ==================== Category Management Views ====================
class AdminCategoryViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for category management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset
    
    @action(detail=False, methods=['get'])
    def hierarchical(self, request):
        """Get categories with nested subcategories"""
        categories = Category.objects.prefetch_related('subcategories').all()
        data = []
        for cat in categories:
            data.append({
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug,
                'subcategories': [
                    {
                        'id': sub.id,
                        'name': sub.name,
                        'slug': sub.slug
                    }
                    for sub in cat.subcategories.all()
                ]
            })
        return Response(data)


class AdminSubcategoryViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for subcategory management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Subcategory.objects.all()
    serializer_class = AdminSubcategorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


# ==================== Color & Material Management Views ====================
class AdminColorViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for color management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Color.objects.all()
    serializer_class = AdminColorSerializer


class AdminMaterialViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for material management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Material.objects.all()
    serializer_class = AdminMaterialSerializer


# ==================== Product Management Views ====================
class AdminProductViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for product management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = None  # We'll handle pagination manually or use default
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AdminProductListSerializer
        return AdminProductDetailSerializer
    
    def get_queryset(self):
        queryset = Product.objects.select_related(
            'category', 'subcategory', 'material'
        ).prefetch_related(
            'images', 'variants__color', 'variants__images'
        ).all().order_by('-created_at')
        
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        is_active = self.request.query_params.get('is_active', None)
        is_featured = self.request.query_params.get('is_featured', None)
        stock_status = self.request.query_params.get('stock_status', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(short_description__icontains=search)
            )
        if category:
            queryset = queryset.filter(category_id=category)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        if stock_status == 'low_stock':
            # Products where total stock (sum of all variants) < global threshold
            low_stock_threshold = GlobalSettings.get_setting('low_stock_threshold', 100)
            products_with_stock = Product.objects.annotate(
                total_stock=Sum('variants__stock_quantity', filter=Q(variants__is_active=True))
            ).filter(total_stock__lt=low_stock_threshold, total_stock__isnull=False, is_active=True)
            queryset = queryset.filter(id__in=products_with_stock.values_list('id', flat=True))
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to provide pagination"""
        from rest_framework.response import Response
        from rest_framework.pagination import PageNumberPagination
        
        class AdminProductPagination(PageNumberPagination):
            page_size = 20
            page_size_query_param = 'page_size'
            max_page_size = 100
        
        queryset = self.filter_queryset(self.get_queryset())
        paginator = AdminProductPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle product active status"""
        product = self.get_object()
        product.is_active = not product.is_active
        product.save()
        try:
            create_admin_log(
                request=request,
                action_type='activate' if product.is_active else 'deactivate',
                model_name='Product',
                object_id=product.id,
                object_repr=str(product),
                details={'is_active': product.is_active}
            )
        except Exception as e:
            print(f"Error creating admin log: {e}")
        return Response({
            'id': product.id,
            'is_active': product.is_active,
            'message': f'Product {"activated" if product.is_active else "deactivated"} successfully'
        })
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle product featured status"""
        product = self.get_object()
        product.is_featured = not product.is_featured
        product.save()
        return Response({
            'id': product.id,
            'is_featured': product.is_featured,
            'message': f'Product {"featured" if product.is_featured else "unfeatured"} successfully'
        })
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """Update stock for a product variant"""
        variant_id = request.data.get('variant_id')
        quantity = request.data.get('quantity')
        
        if not variant_id or quantity is None:
            return Response(
                {'error': 'variant_id and quantity are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            variant = ProductVariant.objects.get(id=variant_id, product_id=pk)
            variant.stock_quantity = quantity
            variant.is_in_stock = quantity > 0
            variant.save()
            return Response({
                'message': 'Stock updated successfully',
                'variant_id': variant.id,
                'stock_quantity': variant.stock_quantity
            })
        except ProductVariant.DoesNotExist:
            return Response(
                {'error': 'Variant not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# ==================== Order Management Views ====================
class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin viewset for order management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Order.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AdminOrderListSerializer
        return AdminOrderDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        payment_status = self.request.query_params.get('payment_status', None)
        payment_method = self.request.query_params.get('payment_method', None)
        search = self.request.query_params.get('search', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if payment_method:
            if payment_method.lower() == 'cod':
                queryset = queryset.filter(payment_method='COD')
            elif payment_method.lower() == 'online':
                # Online payment = anything that's not COD
                queryset = queryset.exclude(payment_method='COD').exclude(
                    payment_method__isnull=True
                ).exclude(payment_method='')
        if search:
            queryset = queryset.filter(
                Q(order_id__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__username__icontains=search)
            )
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = order.status
        order.status = new_status
        
        # Set delivered_at if status is delivered
        if new_status == 'delivered' and not order.delivered_at:
            order.delivered_at = timezone.now()
        
        order.save()
        
        # Create status history entry
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            notes=notes,
            created_by=request.user
        )
        
        return Response({
            'message': f'Order status updated from {old_status} to {new_status}',
            'status': order.status
        })
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update payment status"""
        order = self.get_object()
        new_status = request.data.get('payment_status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response(
                {'error': 'Payment status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = order.payment_status
        order.payment_status = new_status
        order.save()
        
        # Create status history entry
        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            notes=f'Payment status changed to {new_status}. {notes}',
            created_by=request.user
        )
        
        return Response({
            'message': f'Payment status updated from {old_status} to {new_status}',
            'payment_status': order.payment_status
        })
    
    @action(detail=True, methods=['post'])
    def update_tracking(self, request, pk=None):
        """Update tracking information"""
        order = self.get_object()
        tracking_number = request.data.get('tracking_number', '')
        estimated_delivery = request.data.get('estimated_delivery', None)
        notes = request.data.get('notes', '')
        
        order.tracking_number = tracking_number
        if estimated_delivery:
            from datetime import datetime
            try:
                order.estimated_delivery = datetime.strptime(estimated_delivery, '%Y-%m-%d').date()
            except:
                pass
        
        order.save()
        
        # Create status history entry
        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            notes=f'Tracking updated: {tracking_number}. {notes}',
            created_by=request.user
        )
        
        return Response({
            'message': 'Tracking information updated',
            'tracking_number': order.tracking_number,
            'estimated_delivery': order.estimated_delivery
        })
    
    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Get order notes"""
        order = self.get_object()
        notes = order.notes.all().order_by('-created_at')
        return Response([{
            'id': n.id,
            'content': n.content,
            'created_at': n.created_at,
            'created_by': n.created_by.username if n.created_by else None
        } for n in notes])
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add note to order"""
        order = self.get_object()
        note_content = request.data.get('note', '')
        
        if not note_content:
            return Response(
                {'error': 'Note content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        note = OrderNote.objects.create(
            order=order,
            content=note_content,
            created_by=request.user
        )
        
        return Response({
            'id': note.id,
            'content': note.content,
            'created_at': note.created_at,
            'created_by': request.user.username,
            'message': 'Note added successfully'
        })


# ==================== Discount Management Views ====================
# Note: Discounts are filter options for product pages, NOT payment discounts
# Payment discounts are handled by Coupons. This endpoint is for Filter Options management only.
class AdminDiscountViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for discount filter options management (used in Filter Options page)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Discount.objects.all().order_by('percentage')
    serializer_class = AdminDiscountSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


# ==================== Coupon Management Views ====================
class AdminCouponViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for coupon management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = AdminCouponSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active', None)
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(code__icontains=search) |
                Q(description__icontains=search)
            )
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


# ==================== Global Settings Views ====================
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def global_settings(request):
    """Get/Update global settings"""
    if request.method == 'GET':
        # Get all settings or specific setting
        key = request.query_params.get('key', None)
        if key:
            setting = GlobalSettings.objects.filter(key=key).first()
            if setting:
                serializer = GlobalSettingsSerializer(setting)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': f'Setting with key "{key}" not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Return all settings as a dict
            settings = GlobalSettings.objects.all()
            settings_dict = {s.key: s.value for s in settings}
            return Response(settings_dict)
    
    # Update settings
    key = request.data.get('key')
    value = request.data.get('value')
    description = request.data.get('description', '')
    
    if not key or value is None:
        return Response(
            {'error': 'key and value are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    setting = GlobalSettings.set_setting(key, value, description)
    serializer = GlobalSettingsSerializer(setting)
    return Response(serializer.data)


# ==================== Payment & Charges Views ====================
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def payment_charges_settings(request):
    """Get/Update payment and charges settings"""
    from .models import GlobalSettings
    
    if request.method == 'GET':
        # Get platform fees from GlobalSettings or use defaults
        def get_setting_value(key, default):
            value = GlobalSettings.get_setting(key, default)
            # Ensure boolean values are properly converted
            if isinstance(value, bool):
                return value
            if isinstance(value, str) and value.lower() in ['true', 'false']:
                return value.lower() == 'true'
            return value
        
        data = {
            'platform_fee_upi': str(GlobalSettings.get_setting('platform_fee_upi', '0.00')),
            'platform_fee_card': str(GlobalSettings.get_setting('platform_fee_card', '2.36')),
            'platform_fee_netbanking': str(GlobalSettings.get_setting('platform_fee_netbanking', '2.36')),
            'platform_fee_cod': str(GlobalSettings.get_setting('platform_fee_cod', '0.00')),
            'tax_rate': str(GlobalSettings.get_setting('tax_rate', '5.00')),
            'razorpay_enabled': get_setting_value('razorpay_enabled', True),
            'cod_enabled': get_setting_value('cod_enabled', True)
        }
        serializer = PaymentChargeSerializer(data)
        return Response(serializer.data)
    
    # Update settings - save to GlobalSettings
    serializer = PaymentChargeSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        
        # Save each setting to GlobalSettings
        GlobalSettings.set_setting('platform_fee_upi', validated_data.get('platform_fee_upi', '0.00'), 'Platform fee percentage for UPI payments')
        GlobalSettings.set_setting('platform_fee_card', validated_data.get('platform_fee_card', '2.36'), 'Platform fee percentage for Credit/Debit Card payments')
        GlobalSettings.set_setting('platform_fee_netbanking', validated_data.get('platform_fee_netbanking', '2.36'), 'Platform fee percentage for Net Banking payments')
        GlobalSettings.set_setting('platform_fee_cod', validated_data.get('platform_fee_cod', '0.00'), 'Platform fee percentage for COD payments')
        GlobalSettings.set_setting('tax_rate', validated_data.get('tax_rate', '5.00'), 'Tax rate percentage')
        GlobalSettings.set_setting('razorpay_enabled', str(validated_data.get('razorpay_enabled', True)), 'Enable Razorpay payment gateway')
        GlobalSettings.set_setting('cod_enabled', str(validated_data.get('cod_enabled', True)), 'Enable Cash on Delivery')
        
        return Response({
            'message': 'Settings updated successfully',
            **serializer.validated_data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== Contact Query Management Views ====================
class AdminContactQueryViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for contact query management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = ContactQuery.objects.all().order_by('-created_at')
    serializer_class = AdminContactQuerySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(email__icontains=search) |
                Q(pincode__icontains=search)
            )
        return queryset
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update contact query status"""
        contact_query = self.get_object()
        status_value = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if status_value not in dict(ContactQuery.STATUS_CHOICES).keys():
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contact_query.status = status_value
        if notes:
            contact_query.admin_notes = notes
        if status_value == 'resolved':
            contact_query.resolved_at = timezone.now()
        contact_query.save()
        
        serializer = self.get_serializer(contact_query)
        return Response(serializer.data)


# ==================== Bulk Order Management Views ====================
class AdminBulkOrderViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for bulk order management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = BulkOrder.objects.all().order_by('-created_at')
    serializer_class = AdminBulkOrderSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        assigned_to = self.request.query_params.get('assigned_to', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(contact_person__icontains=search) |
                Q(email__icontains=search) |
                Q(phone_number__icontains=search)
            )
        return queryset
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update bulk order status"""
        bulk_order = self.get_object()
        status_value = request.data.get('status')
        notes = request.data.get('notes', '')
        quoted_price = request.data.get('quoted_price', None)
        
        if status_value not in dict(BulkOrder.STATUS_CHOICES).keys():
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bulk_order.status = status_value
        if notes:
            bulk_order.admin_notes = notes
        if quoted_price is not None:
            bulk_order.quoted_price = quoted_price
        bulk_order.save()
        
        serializer = self.get_serializer(bulk_order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign bulk order to admin user"""
        bulk_order = self.get_object()
        admin_id = request.data.get('admin_id')
        
        try:
            admin_user = User.objects.get(id=admin_id, is_staff=True)
            bulk_order.assigned_to = admin_user
            bulk_order.save()
            
            serializer = self.get_serializer(bulk_order)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Admin user not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# ==================== Admin Log Views ====================
class AdminLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin viewset for viewing logs (read-only)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = AdminLog.objects.all().order_by('-created_at')
    serializer_class = AdminLogSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        action_type = self.request.query_params.get('action_type', None)
        model_name = self.request.query_params.get('model_name', None)
        user_id = self.request.query_params.get('user', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to provide pagination"""
        from rest_framework.response import Response
        from rest_framework.pagination import PageNumberPagination
        
        class AdminLogPagination(PageNumberPagination):
            page_size = 20
            page_size_query_param = 'page_size'
            max_page_size = 100
        
        queryset = self.filter_queryset(self.get_queryset())
        paginator = AdminLogPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

