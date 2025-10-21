from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.urls import reverse


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

    @property
    def is_parent(self):
        return self.parent is None

    def get_all_subcategories(self):
        """Get all subcategories recursively"""
        subcategories = list(self.subcategories.all())
        for subcategory in list(subcategories):
            subcategories.extend(subcategory.get_all_subcategories())
        return subcategories


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    AVAILABILITY_CHOICES = [
        ('in_stock', 'In Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('limited_stock', 'Limited Stock'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    short_description = models.TextField(max_length=500, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Inventory
    stock_quantity = models.PositiveIntegerField(default=0)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='in_stock')
    
    # Product details
    sku = models.CharField(max_length=100, unique=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dimensions = models.CharField(max_length=100, blank=True)
    
    # SEO and display
    slug = models.SlugField(max_length=200, unique=True)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(max_length=160, blank=True)
    
    # Status and timestamps
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['brand']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
        ]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('product_detail', kwargs={'slug': self.slug})

    @property
    def average_rating(self):
        reviews = self.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(sum(review.rating for review in reviews) / reviews.count(), 1)
        return 0

    @property
    def review_count(self):
        return self.reviews.filter(is_approved=True).count()

    @property
    def discount_amount(self):
        if self.old_price and self.old_price > self.price:
            return self.old_price - self.price
        return 0

    @property
    def is_on_sale(self):
        return self.old_price and self.old_price > self.price

    @property
    def main_image(self):
        main_img = self.images.filter(is_main=True).first()
        return main_img.image if main_img else None


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.URLField(max_length=500)  # Support external image URLs
    alt_text = models.CharField(max_length=200, blank=True)
    is_main = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.product.title} - Image {self.order}"

    def save(self, *args, **kwargs):
        # Ensure only one main image per product
        if self.is_main:
            ProductImage.objects.filter(product=self.product, is_main=True).update(is_main=False)
        super().save(*args, **kwargs)


class FilterAttribute(models.Model):
    """Defines filterable attributes for categories"""
    FIELD_TYPES = [
        ('select', 'Select (Dropdown)'),
        ('multiselect', 'Multi-select'),
        ('range', 'Range (Min-Max)'),
        ('checkbox', 'Checkbox'),
        ('color', 'Color Picker'),
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='filter_attributes')
    name = models.CharField(max_length=100)  # e.g., "RAM", "Storage", "Screen Size"
    slug = models.SlugField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    is_required = models.BooleanField(default=False)
    is_filterable = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['category', 'slug']
        ordering = ['sort_order', 'name']

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class FilterAttributeOption(models.Model):
    """Options for filterable attributes"""
    attribute = models.ForeignKey(FilterAttribute, on_delete=models.CASCADE, related_name='options')
    value = models.CharField(max_length=200)
    color_code = models.CharField(max_length=7, blank=True)  # For color attributes
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['attribute', 'value']
        ordering = ['sort_order', 'value']

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"


class ProductAttribute(models.Model):
    """Product-specific attribute values"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes')
    filter_attribute = models.ForeignKey(FilterAttribute, on_delete=models.CASCADE, null=True, blank=True)
    value = models.TextField()  # Can store single value or JSON for multiple values
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'filter_attribute']

    def __str__(self):
        return f"{self.product.title} - {self.filter_attribute.name}: {self.value}"


class ProductVariant(models.Model):
    """Product variants for different sizes, colors, etc."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)  # e.g., "iPhone 15 - 128GB - Blue"
    
    # Pricing can override product price
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Inventory specific to variant
    stock_quantity = models.PositiveIntegerField(default=0)
    
    # Variant attributes (size, color, storage, etc.)
    attributes = models.JSONField(default=dict)  # {"color": "Blue", "size": "M", "storage": "128GB"}
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.product.title} - {self.name}"

    @property
    def effective_price(self):
        return self.price if self.price else self.product.price

    @property
    def effective_old_price(self):
        return self.old_price if self.old_price else self.product.old_price


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    is_verified_purchase = models.BooleanField(default=False)
    helpful_votes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['product', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.title} - {self.rating} stars by {self.user.username}"


class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"
