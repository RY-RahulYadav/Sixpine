from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    dashboard_stats, AdminUserViewSet, AdminCategoryViewSet,
    AdminSubcategoryViewSet, AdminColorViewSet, AdminMaterialViewSet,
    AdminProductViewSet, AdminOrderViewSet, AdminDiscountViewSet,
    AdminCouponViewSet, payment_charges_settings, global_settings,
    AdminContactQueryViewSet, AdminBulkOrderViewSet, AdminLogViewSet,
    AdminHomePageContentViewSet
)
from .auth import admin_login_view

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'subcategories', AdminSubcategoryViewSet, basename='admin-subcategories')
router.register(r'colors', AdminColorViewSet, basename='admin-colors')
router.register(r'materials', AdminMaterialViewSet, basename='admin-materials')
router.register(r'products', AdminProductViewSet, basename='admin-products')
router.register(r'orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'discounts', AdminDiscountViewSet, basename='admin-discounts')  # For filter options only
router.register(r'coupons', AdminCouponViewSet, basename='admin-coupons')
router.register(r'contact-queries', AdminContactQueryViewSet, basename='admin-contact-queries')
router.register(r'bulk-orders', AdminBulkOrderViewSet, basename='admin-bulk-orders')
router.register(r'logs', AdminLogViewSet, basename='admin-logs')
router.register(r'homepage-content', AdminHomePageContentViewSet, basename='admin-homepage-content')

urlpatterns = [
    path('auth/login/', admin_login_view, name='admin-login'),
    path('dashboard/stats/', dashboard_stats, name='admin-dashboard-stats'),
    path('payment-charges/', payment_charges_settings, name='admin-payment-charges'),
    path('global-settings/', global_settings, name='admin-global-settings'),
    path('', include(router.urls)),
]

