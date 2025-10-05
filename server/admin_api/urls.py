from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminUserViewSet,
    AdminProductViewSet,
    AdminOrderViewSet,
    AdminCategoryViewSet,
    AdminDashboardStatsView,
    AdminLogViewSet
)
from .auth import admin_login_view

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'users', AdminUserViewSet)
router.register(r'products', AdminProductViewSet)
router.register(r'orders', AdminOrderViewSet)
router.register(r'categories', AdminCategoryViewSet)
router.register(r'logs', AdminLogViewSet)

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Dashboard stats
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    
    # Admin auth endpoints
    path('auth/login/', admin_login_view, name='admin-login'),
]