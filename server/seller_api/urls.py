from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    seller_dashboard_stats, seller_brand_analytics, seller_shipment_settings,
    seller_settings, seller_change_password,
    SellerCategoryViewSet, SellerSubcategoryViewSet,
    SellerColorViewSet, SellerMaterialViewSet, SellerProductViewSet, SellerOrderViewSet,
    SellerCouponViewSet
)

router = DefaultRouter()
router.register(r'categories', SellerCategoryViewSet, basename='seller-categories')
router.register(r'subcategories', SellerSubcategoryViewSet, basename='seller-subcategories')
router.register(r'colors', SellerColorViewSet, basename='seller-colors')
router.register(r'materials', SellerMaterialViewSet, basename='seller-materials')
router.register(r'products', SellerProductViewSet, basename='seller-products')
router.register(r'orders', SellerOrderViewSet, basename='seller-orders')
router.register(r'coupons', SellerCouponViewSet, basename='seller-coupons')

urlpatterns = [
    path('dashboard/stats/', seller_dashboard_stats, name='seller-dashboard-stats'),
    path('brand-analytics/', seller_brand_analytics, name='seller-brand-analytics'),
    path('shipment-settings/', seller_shipment_settings, name='seller-shipment-settings'),
    path('settings/', seller_settings, name='seller-settings'),
    path('settings/change-password/', seller_change_password, name='seller-change-password'),
    path('', include(router.urls)),
]

