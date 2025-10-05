from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/filters/', views.category_filters, name='category-filters'),
    path('brands/', views.BrandListView.as_view(), name='brand-list'),
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    path('products/new-arrivals/', views.NewArrivalsView.as_view(), name='new-arrivals'),
    path('products/search/', views.search_products, name='search-products'),
    path('products/advanced-search/', views.advanced_search, name='advanced-search'),
    path('search/suggestions/', views.search_suggestions, name='search-suggestions'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/<slug:slug>/reviews/', views.ProductReviewListCreateView.as_view(), name='product-reviews'),
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:pk>/', views.WishlistDetailView.as_view(), name='wishlist-detail'),
    path('home-data/', views.home_data, name='home-data'),
]