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
from .models import GlobalSettings, HomePageContent
from .serializers import (
    DashboardStatsSerializer, AdminUserListSerializer, AdminUserDetailSerializer,
    AdminUserCreateSerializer, AdminUserUpdateSerializer, AdminCategorySerializer,
    AdminSubcategorySerializer, AdminColorSerializer, AdminMaterialSerializer,
    AdminProductListSerializer, AdminProductDetailSerializer,
    AdminOrderListSerializer, AdminOrderDetailSerializer, AdminDiscountSerializer,
    PaymentChargeSerializer, GlobalSettingsSerializer,
    AdminContactQuerySerializer, AdminBulkOrderSerializer, AdminLogSerializer,
    AdminCouponSerializer, HomePageContentSerializer
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
    serializer_class = AdminUserListSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminUserDetailSerializer
        elif self.action == 'create':
            return AdminUserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUserUpdateSerializer
        return AdminUserListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        is_active = self.request.query_params.get('is_active', None)
        is_staff = self.request.query_params.get('is_staff', None)
        
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone_number__icontains=search)
            )
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if is_staff is not None:
            queryset = queryset.filter(is_staff=is_staff.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        create_admin_log(
            user=request.user,
            action_type='activate' if user.is_active else 'deactivate',
            model_name='User',
            object_id=user.id,
            object_repr=str(user)
        )
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_staff(self, request, pk=None):
        """Toggle user staff status"""
        user = self.get_object()
        user.is_staff = not user.is_staff
        user.save()
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='User',
            object_id=user.id,
            object_repr=str(user),
            details={'is_staff': user.is_staff}
        )
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password"""
        user = self.get_object()
        password = request.data.get('password')
        
        if not password:
            return Response(
                {'error': 'Password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(password)
        user.save()
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='User',
            object_id=user.id,
            object_repr=str(user),
            details={'action': 'password_reset'}
        )
        
        return Response({'message': 'Password reset successfully'})


# ==================== Category Management Views ====================
class AdminCategoryViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for category management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Category.objects.all().order_by('sort_order', 'name')
    serializer_class = AdminCategorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def hierarchical(self, request):
        """Get categories with subcategories"""
        categories = Category.objects.filter(is_active=True).prefetch_related('subcategories')
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


# ==================== Subcategory Management Views ====================
class AdminSubcategoryViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for subcategory management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Subcategory.objects.all().order_by('sort_order', 'name')
    serializer_class = AdminSubcategorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if category:
            queryset = queryset.filter(category_id=category)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


# ==================== Color Management Views ====================
class AdminColorViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for color management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Color.objects.all().order_by('name')
    serializer_class = AdminColorSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset


# ==================== Material Management Views ====================
class AdminMaterialViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for material management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Material.objects.all().order_by('name')
    serializer_class = AdminMaterialSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset


# ==================== Product Management Views ====================
class AdminProductViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for product management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Product.objects.all().select_related('category', 'subcategory').prefetch_related(
        'images', 'variants', 'specifications', 'features'
    ).order_by('-created_at')
    serializer_class = AdminProductListSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminProductDetailSerializer
        return AdminProductListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        subcategory = self.request.query_params.get('subcategory', None)
        is_active = self.request.query_params.get('is_active', None)
        is_featured = self.request.query_params.get('is_featured', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(sku__icontains=search)
            )
        if category:
            queryset = queryset.filter(category_id=category)
        if subcategory:
            queryset = queryset.filter(subcategory_id=subcategory)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle product active status"""
        product = self.get_object()
        product.is_active = not product.is_active
        product.save()
        
        create_admin_log(
            user=request.user,
            action_type='activate' if product.is_active else 'deactivate',
            model_name='Product',
            object_id=product.id,
            object_repr=str(product)
        )
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle product featured status"""
        product = self.get_object()
        product.is_featured = not product.is_featured
        product.save()
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='Product',
            object_id=product.id,
            object_repr=str(product),
            details={'is_featured': product.is_featured}
        )
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """Update product variant stock"""
        product = self.get_object()
        variant_id = request.data.get('variant_id')
        quantity = request.data.get('quantity')
        
        if not variant_id or quantity is None:
            return Response(
                {'error': 'variant_id and quantity are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            variant = product.variants.get(id=variant_id)
            variant.stock_quantity = quantity
            variant.save()
            
            create_admin_log(
                user=request.user,
                action_type='update',
                model_name='ProductVariant',
                object_id=variant.id,
                object_repr=str(variant),
                details={'stock_quantity': quantity}
            )
            
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
class AdminOrderViewSet(AdminLoggingMixin, viewsets.ReadOnlyModelViewSet):
    """Admin viewset for order management (read-only with custom actions)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Order.objects.all().select_related('user').prefetch_related(
        'items', 'status_history', 'notes'
    ).order_by('-created_at')
    serializer_class = AdminOrderListSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminOrderDetailSerializer
        return AdminOrderListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        status_filter = self.request.query_params.get('status', None)
        payment_status = self.request.query_params.get('payment_status', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if search:
            queryset = queryset.filter(
                Q(order_id__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__phone_number__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
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
        order.save()
        
        # Create status history entry
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            notes=notes,
            changed_by=request.user
        )
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='Order',
            object_id=order.id,
            object_repr=str(order),
            details={'status': {'old': old_status, 'new': new_status}}
        )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update order payment status"""
        order = self.get_object()
        new_payment_status = request.data.get('payment_status')
        notes = request.data.get('notes', '')
        
        if not new_payment_status:
            return Response(
                {'error': 'Payment status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_payment_status = order.payment_status
        order.payment_status = new_payment_status
        order.save()
        
        # Create order note if provided
        if notes:
            OrderNote.objects.create(
                order=order,
                note=notes,
                created_by=request.user
            )
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='Order',
            object_id=order.id,
            object_repr=str(order),
            details={'payment_status': {'old': old_payment_status, 'new': new_payment_status}}
        )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_tracking(self, request, pk=None):
        """Update order tracking information"""
        order = self.get_object()
        tracking_number = request.data.get('tracking_number')
        estimated_delivery = request.data.get('estimated_delivery')
        notes = request.data.get('notes', '')
        
        if tracking_number:
            order.tracking_number = tracking_number
        if estimated_delivery:
            order.estimated_delivery = estimated_delivery
        order.save()
        
        # Create order note if provided
        if notes:
            OrderNote.objects.create(
                order=order,
                note=notes,
                created_by=request.user
            )
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='Order',
            object_id=order.id,
            object_repr=str(order),
            details={'tracking_number': tracking_number, 'estimated_delivery': estimated_delivery}
        )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Get order notes"""
        order = self.get_object()
        notes = order.notes.all().order_by('-created_at')
        notes_data = [{
            'id': note.id,
            'note': note.note,
            'created_by': note.created_by.username if note.created_by else 'System',
            'created_at': note.created_at
        } for note in notes]
        return Response(notes_data)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add note to order"""
        order = self.get_object()
        note_text = request.data.get('note')
        
        if not note_text:
            return Response(
                {'error': 'Note text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        note = OrderNote.objects.create(
            order=order,
            note=note_text,
            created_by=request.user
        )
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='Order',
            object_id=order.id,
            object_repr=str(order),
            details={'action': 'note_added', 'note_id': note.id}
        )
        
        return Response({
            'id': note.id,
            'note': note.note,
            'created_by': note.created_by.username,
            'created_at': note.created_at
        })


# ==================== Discount Management Views ====================
class AdminDiscountViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for discount management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Discount.objects.all().order_by('-created_at')
    serializer_class = AdminDiscountSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if search:
            queryset = queryset.filter(name__icontains=search)
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
        search = self.request.query_params.get('search', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if search:
            queryset = queryset.filter(
                Q(code__icontains=search) |
                Q(description__icontains=search)
            )
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


# ==================== Payment Charges Settings ====================
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def payment_charges_settings(request):
    """Get or update payment charges settings"""
    if request.method == 'GET':
        settings = {
            'cod_charge': float(GlobalSettings.get_setting('cod_charge', 0)),
            'free_delivery_threshold': float(GlobalSettings.get_setting('free_delivery_threshold', 0)),
            'delivery_charge': float(GlobalSettings.get_setting('delivery_charge', 0)),
        }
        serializer = PaymentChargeSerializer(settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        data = request.data
        GlobalSettings.set_setting('cod_charge', data.get('cod_charge', 0), 'COD charge amount')
        GlobalSettings.set_setting('free_delivery_threshold', data.get('free_delivery_threshold', 0), 'Free delivery threshold')
        GlobalSettings.set_setting('delivery_charge', data.get('delivery_charge', 0), 'Delivery charge amount')
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='GlobalSettings',
            object_id=None,
            object_repr='Payment Charges',
            details=data
        )
        
        settings = {
            'cod_charge': float(GlobalSettings.get_setting('cod_charge', 0)),
            'free_delivery_threshold': float(GlobalSettings.get_setting('free_delivery_threshold', 0)),
            'delivery_charge': float(GlobalSettings.get_setting('delivery_charge', 0)),
        }
        serializer = PaymentChargeSerializer(settings)
        return Response(serializer.data)


# ==================== Global Settings ====================
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def global_settings(request):
    """Get or update global settings"""
    key = request.query_params.get('key', None)
    
    if request.method == 'GET':
        if key:
            try:
                setting = GlobalSettings.objects.get(key=key)
                serializer = GlobalSettingsSerializer(setting)
                return Response(serializer.data)
            except GlobalSettings.DoesNotExist:
                return Response(
                    {'error': 'Setting not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            settings = GlobalSettings.objects.all()
            serializer = GlobalSettingsSerializer(settings, many=True)
            return Response(serializer.data)
    
    elif request.method == 'PUT':
        data = request.data
        key = data.get('key')
        value = data.get('value')
        description = data.get('description', '')
        
        if not key or value is None:
            return Response(
                {'error': 'key and value are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        setting = GlobalSettings.set_setting(key, value, description)
        
        create_admin_log(
            user=request.user,
            action_type='update',
            model_name='GlobalSettings',
            object_id=setting.id,
            object_repr=str(setting),
            details={'key': key, 'value': value}
        )
        
        serializer = GlobalSettingsSerializer(setting)
        return Response(serializer.data)


# ==================== Contact Query Views ====================
class AdminContactQueryViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for contact query management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = ContactQuery.objects.all().order_by('-created_at')
    serializer_class = AdminContactQuerySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        status_filter = self.request.query_params.get('status', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(message__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update contact query status"""
        contact_query = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contact_query.status = new_status
        if notes:
            contact_query.admin_notes = notes
        contact_query.save()
        
        serializer = self.get_serializer(contact_query)
        return Response(serializer.data)


# ==================== Bulk Order Views ====================
class AdminBulkOrderViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for bulk order management"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = BulkOrder.objects.all().select_related('assigned_to').order_by('-created_at')
    serializer_class = AdminBulkOrderSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        status_filter = self.request.query_params.get('status', None)
        assigned_to = self.request.query_params.get('assigned_to', None)
        
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(contact_person__icontains=search) |
                Q(email__icontains=search) |
                Q(phone_number__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
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


# ==================== Home Page Content Views ====================
class AdminHomePageContentViewSet(AdminLoggingMixin, viewsets.ModelViewSet):
    """Admin viewset for managing home page content sections"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = HomePageContent.objects.all()
    serializer_class = HomePageContentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        section_key = self.request.query_params.get('section_key', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if section_key:
            queryset = queryset.filter(section_key=section_key)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('order', 'section_name')
    
    def perform_create(self, serializer):
        """Create with logging"""
        instance = serializer.save()
        create_admin_log(
            request=self.request,
            action_type='create',
            model_name='HomePageContent',
            object_id=instance.id,
            object_repr=str(instance),
            details={'section_key': instance.section_key}
        )
    
    def perform_update(self, serializer):
        """Update with logging"""
        instance = serializer.save()
        create_admin_log(
            request=self.request,
            action_type='update',
            model_name='HomePageContent',
            object_id=instance.id,
            object_repr=str(instance),
            details={'section_key': instance.section_key}
        )
    
    def perform_destroy(self, instance):
        """Delete with logging"""
        create_admin_log(
            request=self.request,
            action_type='delete',
            model_name='HomePageContent',
            object_id=instance.id,
            object_repr=str(instance),
            details={'section_key': instance.section_key}
        )
        instance.delete()
