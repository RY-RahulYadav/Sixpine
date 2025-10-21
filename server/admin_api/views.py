from rest_framework import viewsets, permissions, generics, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta
import ipaddress

from products.models import Product, Category, Brand, ProductImage, ProductVariant
from orders.models import Order, OrderItem, OrderStatusHistory
from accounts.models import User
from .models import AdminLog, AdminDashboardSetting
from .serializers import (
    AdminUserSerializer, AdminUserDetailSerializer,
    AdminProductSerializer, AdminProductDetailSerializer,
    AdminOrderSerializer, AdminOrderDetailSerializer,
    AdminCategorySerializer, AdminDashboardStatsSerializer,
    AdminLogSerializer
)
from .permissions import IsAdminUser


class AdminPagination(PageNumberPagination):
    """Custom pagination for admin API"""
    page_size = 50  # Default page size
    page_size_query_param = 'limit'  # Use 'limit' query parameter
    max_page_size = 100


class AdminUserViewSet(viewsets.ModelViewSet):
    """ViewSet for admin user management"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined', 'last_login', 'is_active']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminUserDetailSerializer
        return AdminUserSerializer
    
    def create(self, request, *args, **kwargs):
        # Create user with admin permissions
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Add staff status to new user
        user = serializer.save()
        user.is_staff = True
        user.set_password(request.data.get('password'))
        user.save()
        
        # Log action
        AdminLog.objects.create(
            user=request.user,
            action='create',
            model_name='User',
            object_id=str(user.id),
            details=f"Created admin user: {user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_update(self, serializer):
        instance = serializer.save()
        # Log action
        AdminLog.objects.create(
            user=self.request.user,
            action='update',
            model_name='User',
            object_id=str(instance.id),
            details=f"Updated user: {instance.username}",
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_destroy(self, instance):
        # Log action before deleting
        AdminLog.objects.create(
            user=self.request.user,
            action='delete',
            model_name='User',
            object_id=str(instance.id),
            details=f"Deleted user: {instance.username}",
            ip_address=self.get_client_ip(self.request)
        )
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        # Log action
        action_desc = "Activated" if user.is_active else "Deactivated"
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='User',
            object_id=str(user.id),
            details=f"{action_desc} user: {user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': f'User {action_desc.lower()}'})
    
    @action(detail=True, methods=['post'])
    def toggle_staff(self, request, pk=None):
        """Toggle user staff status"""
        user = self.get_object()
        user.is_staff = not user.is_staff
        user.save()
        
        # Log action
        action_desc = "Granted admin access to" if user.is_staff else "Removed admin access from"
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='User',
            object_id=str(user.id),
            details=f"{action_desc} user: {user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': f'Admin status {"granted" if user.is_staff else "removed"}'})
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password"""
        user = self.get_object()
        new_password = request.data.get('password')
        
        if not new_password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        # Log action (don't include the actual password in logs)
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='User',
            object_id=str(user.id),
            details=f"Reset password for user: {user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': 'Password reset successful'})
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        try:
            # Validate IP address
            ipaddress.ip_address(ip)
            return ip
        except ValueError:
            return None


class AdminProductViewSet(viewsets.ModelViewSet):
    """ViewSet for admin product management"""
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'sku', 'description']
    ordering_fields = ['title', 'price', 'stock_quantity', 'created_at', 'is_active']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category_id = self.request.query_params.get('category', '').strip()
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by brand
        brand_id = self.request.query_params.get('brand', '').strip()
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        
        # Filter by stock status
        stock_status = self.request.query_params.get('stock_status', '').strip()
        if stock_status == 'in_stock':
            queryset = queryset.filter(stock_quantity__gt=0)
        elif stock_status == 'out_of_stock':
            queryset = queryset.filter(stock_quantity=0)
        elif stock_status == 'low_stock':
            queryset = queryset.filter(stock_quantity__gt=0, stock_quantity__lte=10)
        
        # Filter by status (active/inactive)
        is_active = self.request.query_params.get('is_active', '').strip()
        if is_active and is_active.lower() in ['true', 'false']:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return AdminProductDetailSerializer
        return AdminProductSerializer
    
    def perform_create(self, serializer):
        instance = serializer.save()
        
        # Handle image uploads if present in request
        images = self.request.FILES.getlist('images', [])
        for idx, image_file in enumerate(images):
            ProductImage.objects.create(
                product=instance,
                image=image_file,
                is_main=(idx == 0),  # First image is main
                order=idx
            )
        
        # Log action
        AdminLog.objects.create(
            user=self.request.user,
            action='create',
            model_name='Product',
            object_id=str(instance.id),
            details=f"Created product: {instance.title}",
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Handle image uploads if present in request
        images = self.request.FILES.getlist('images', [])
        if images:
            # Get current max order
            max_order = instance.images.count()
            for idx, image_file in enumerate(images):
                ProductImage.objects.create(
                    product=instance,
                    image=image_file,
                    is_main=False,  # Don't auto-set as main when updating
                    order=max_order + idx
                )
        
        # Log action
        AdminLog.objects.create(
            user=self.request.user,
            action='update',
            model_name='Product',
            object_id=str(instance.id),
            details=f"Updated product: {instance.title}",
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_destroy(self, instance):
        # Log action before deleting
        AdminLog.objects.create(
            user=self.request.user,
            action='delete',
            model_name='Product',
            object_id=str(instance.id),
            details=f"Deleted product: {instance.title}",
            ip_address=self.get_client_ip(self.request)
        )
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle product active status"""
        product = self.get_object()
        product.is_active = not product.is_active
        product.save()
        
        # Log action
        action_desc = "Activated" if product.is_active else "Deactivated"
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='Product',
            object_id=str(product.id),
            details=f"{action_desc} product: {product.title}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': f'Product {action_desc.lower()}'})
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle product featured status"""
        product = self.get_object()
        product.is_featured = not product.is_featured
        product.save()
        
        # Log action
        action_desc = "Featured" if product.is_featured else "Unfeatured"
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='Product',
            object_id=str(product.id),
            details=f"{action_desc} product: {product.title}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': f'Product {action_desc.lower()}'})
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """Update product stock quantity"""
        product = self.get_object()
        quantity = request.data.get('quantity')
        
        if quantity is None:
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quantity = int(quantity)
            if quantity < 0:
                return Response({'error': 'Quantity cannot be negative'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_quantity = product.stock_quantity
        product.stock_quantity = quantity
        product.save()
        
        # Log action
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='Product',
            object_id=str(product.id),
            details=f"Updated stock for product: {product.title} from {old_quantity} to {quantity}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': 'Stock updated successfully'})
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        try:
            # Validate IP address
            ipaddress.ip_address(ip)
            return ip
        except ValueError:
            return None


class AdminOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for admin order management"""
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_id', 'user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'total_amount', 'status', 'payment_status']

    from orders.models import OrderNote
    from orders.serializers import OrderNoteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by order status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by payment status
        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return AdminOrderDetailSerializer
        return AdminOrderSerializer
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not status or status not in [choice[0] for choice in Order.STATUS_CHOICES]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = order.status
        order.status = status
        order.save()
        
        # Create status history entry
        OrderStatusHistory.objects.create(
            order=order,
            status=status,
            notes=notes,
            created_by=request.user
        )
        
        # Log action
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='Order',
            object_id=str(order.id),
            details=f"Updated order status: {order.order_id} from {old_status} to {status}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': 'Order status updated successfully'})
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update order payment status"""
        order = self.get_object()
        payment_status = request.data.get('payment_status')
        notes = request.data.get('notes', '')
        
        if not payment_status or payment_status not in [choice[0] for choice in Order.PAYMENT_STATUS_CHOICES]:
            return Response({'error': 'Invalid payment status'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = order.payment_status
        order.payment_status = payment_status
        order.save()
        
        # Create status history entry
        OrderStatusHistory.objects.create(
            order=order,
            status=f"payment_{payment_status}",
            notes=f"Payment status updated to {payment_status}. {notes}",
            created_by=request.user
        )
        
        # Log action
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='Order',
            object_id=str(order.id),
            details=f"Updated order payment status: {order.order_id} from {old_status} to {payment_status}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': 'Order payment status updated successfully'})
    
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
            try:
                order.estimated_delivery = estimated_delivery
            except ValueError:
                return Response({'error': 'Invalid date format for estimated delivery'}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        order.save()
        
        # Create status history entry for tracking update
        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            notes=f"Tracking information updated. Tracking #: {tracking_number}. {notes}",
            created_by=request.user
        )
        
        # Log action
        AdminLog.objects.create(
            user=request.user,
            action='update',
            model_name='Order',
            object_id=str(order.id),
            details=f"Updated tracking for order: {order.order_id}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'status': 'Tracking information updated successfully'})
        
    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Get all notes for an order"""
        from orders.models import OrderNote
        from orders.serializers import OrderNoteSerializer
        
        order = self.get_object()
        notes = OrderNote.objects.filter(order=order).order_by('-created_at')
        serializer = OrderNoteSerializer(notes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to an order"""
        from orders.models import OrderNote
        from orders.serializers import OrderNoteSerializer
        
        order = self.get_object()
        content = request.data.get('note')
        
        if not content:
            return Response({'error': 'Note content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        note = OrderNote.objects.create(
            order=order,
            content=content,
            created_by=request.user
        )
        
        # Log action
        AdminLog.objects.create(
            user=request.user,
            action='create',
            model_name='OrderNote',
            object_id=str(order.id),
            details=f"Added note to order: {order.order_id}",
            ip_address=self.get_client_ip(request)
        )
        
        serializer = OrderNoteSerializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        try:
            # Validate IP address
            ipaddress.ip_address(ip)
            return ip
        except ValueError:
            return None


class AdminCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for admin category management"""
    queryset = Category.objects.all().order_by('sort_order', 'name')
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'sort_order', 'is_active']

    def perform_create(self, serializer):
        instance = serializer.save()
        # Log action
        AdminLog.objects.create(
            user=self.request.user,
            action='create',
            model_name='Category',
            object_id=str(instance.id),
            details=f"Created category: {instance.name}",
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        instance = serializer.save()
        # Log action
        AdminLog.objects.create(
            user=self.request.user,
            action='update',
            model_name='Category',
            object_id=str(instance.id),
            details=f"Updated category: {instance.name}",
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_destroy(self, instance):
        # Log action before deleting
        AdminLog.objects.create(
            user=self.request.user,
            action='delete',
            model_name='Category',
            object_id=str(instance.id),
            details=f"Deleted category: {instance.name}",
            ip_address=self.get_client_ip(self.request)
        )
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def hierarchical(self, request):
        """Get categories in hierarchical structure"""
        # Get all parent categories
        parents = Category.objects.filter(parent__isnull=True).order_by('sort_order', 'name')
        
        # Build hierarchical structure
        result = []
        for parent in parents:
            parent_data = AdminCategorySerializer(parent).data
            # Get subcategories for this parent
            subcategories = Category.objects.filter(parent=parent).order_by('sort_order', 'name')
            parent_data['subcategories'] = AdminCategorySerializer(subcategories, many=True).data
            result.append(parent_data)
        
        return Response(result)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        try:
            # Validate IP address
            ipaddress.ip_address(ip)
            return ip
        except ValueError:
            return None


class AdminDashboardStatsView(generics.GenericAPIView):
    """View for admin dashboard statistics"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminDashboardStatsSerializer
    
    def get(self, request):
        # Calculate date ranges
        today = timezone.now().date()
        start_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        end_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))
        
        # Count users
        total_users = User.objects.count()
        
        # Count orders and revenue
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(payment_status='paid').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        # Count products
        total_products = Product.objects.count()
        
        # Count pending orders
        pending_orders = Order.objects.filter(status='pending').count()
        
        # Count low stock products (less than 10 items)
        low_stock_products = Product.objects.filter(stock_quantity__gt=0, stock_quantity__lt=10).count()
        
        # Get recent orders
        recent_orders = Order.objects.order_by('-created_at')[:10]
        
        # Get top selling products
        top_products = OrderItem.objects.values('product').annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:10]
        
        top_selling_products = []
        for item in top_products:
            product = Product.objects.get(id=item['product'])
            top_selling_products.append({
                'id': product.id,
                'title': product.title,
                'sold': item['total_sold'],
                'price': float(product.price),
                'revenue': float(product.price) * item['total_sold']
            })
        
        # Get sales by day for the last 30 days
        thirty_days_ago = today - timedelta(days=30)
        sales_by_day = []
        
        for i in range(30):
            date = thirty_days_ago + timedelta(days=i)
            orders = Order.objects.filter(
                created_at__date=date,
                payment_status='paid'
            )
            revenue = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            count = orders.count()
            
            sales_by_day.append({
                'date': date.strftime('%Y-%m-%d'),
                'revenue': float(revenue),
                'orders': count
            })
        
        data = {
            'total_users': total_users,
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'total_products': total_products,
            'pending_orders': pending_orders,
            'low_stock_products': low_stock_products,
            'recent_orders': AdminOrderSerializer(recent_orders, many=True).data,
            'top_selling_products': top_selling_products,
            'sales_by_day': sales_by_day
        }
        
        return Response(data)


class AdminLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for admin action logs (read-only)"""
    queryset = AdminLog.objects.all().order_by('-created_at')
    serializer_class = AdminLogSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'action', 'model_name', 'details']
    ordering_fields = ['created_at', 'user', 'action']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by action type
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset
