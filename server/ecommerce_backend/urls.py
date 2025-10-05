"""
URL configuration for ecommerce_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .swagger_views import serve_swagger_ui, serve_swagger_yaml

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('products.urls')),
    path('api/', include('cart.urls')),
    path('api/', include('orders.urls')),
    path('api/admin/', include('admin_api.urls')),
    
    # Swagger Documentation
    path('docs/', serve_swagger_ui, name='swagger-ui'),
    path('api/swagger.yml', serve_swagger_yaml, name='swagger-yaml'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
