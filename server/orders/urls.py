from django.urls import path
from . import views

urlpatterns = [
    path('addresses/', views.AddressListCreateView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address-detail'),
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/<uuid:order_id>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/create/', views.OrderCreateView.as_view(), name='order-create'),
    path('orders/checkout/', views.checkout_from_cart, name='checkout-from-cart'),
    path('orders/<uuid:order_id>/cancel/', views.cancel_order, name='cancel-order'),
]