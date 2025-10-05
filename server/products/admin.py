from django.contrib import admin
from .models import Category, Brand, Product, ProductImage, ProductAttribute, Review, Wishlist


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_main', 'order']


class ProductAttributeInline(admin.TabularInline):
    model = ProductAttribute
    extra = 1
    fields = ['attribute_type', 'name', 'value']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'description': ('name',)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'brand', 'price', 'stock_quantity', 'is_active', 'is_featured']
    list_filter = ['category', 'brand', 'is_active', 'is_featured', 'is_new_arrival', 'created_at']
    search_fields = ['title', 'description', 'sku']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProductImageInline, ProductAttributeInline]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description', 'category', 'brand')
        }),
        ('Pricing', {
            'fields': ('price', 'old_price', 'discount_percentage')
        }),
        ('Inventory', {
            'fields': ('sku', 'stock_quantity', 'availability')
        }),
        ('Product Details', {
            'fields': ('weight', 'dimensions')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured', 'is_new_arrival')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'alt_text', 'is_main', 'order', 'created_at']
    list_filter = ['is_main', 'created_at']
    search_fields = ['product__title', 'alt_text']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'title', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved', 'is_verified_purchase', 'created_at']
    search_fields = ['product__title', 'user__username', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__title']
