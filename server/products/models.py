from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings


class Category(models.Model):
    """Main product categories like Sofas, Recliners, etc."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    # store an external or CDN URL to the category image instead of uploading files
    image = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['sort_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Subcategory(models.Model):
    """Subcategories like 3-Seater, 2-Seater for Sofas"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Subcategories"
        unique_together = ['name', 'category']
        ordering = ['sort_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class Color(models.Model):
    """Product colors for filtering"""
    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(max_length=7, blank=True)  # For color display
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Material(models.Model):
    """Product materials for filtering"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """Main product model"""
    # Basic Information
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    short_description = models.TextField(max_length=500)
    long_description = models.TextField(blank=True)
    
    # Categorization
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    subcategory = models.ForeignKey(Subcategory, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    is_on_sale = models.BooleanField(default=False)
    discount_percentage = models.PositiveIntegerField(default=0, validators=[MaxValueValidator(100)])
    
    # Images
    # store an external or CDN URL to the product's main image
    main_image = models.URLField(max_length=500, blank=True, null=True)
    
    # Ratings and Reviews
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.PositiveIntegerField(default=0)
    
    # Product Details
    brand = models.CharField(max_length=100, default='Sixpine')  # Single brand as per requirements
    material = models.ForeignKey(Material, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    dimensions = models.CharField(max_length=100, blank=True)  # e.g., "L x W x H"
    weight = models.CharField(max_length=50, blank=True)
    warranty = models.CharField(max_length=100, blank=True)
    assembly_required = models.BooleanField(default=False)
    
    # SEO and Display
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Calculate discount percentage
        if self.old_price and self.old_price > self.price:
            self.discount_percentage = int(((self.old_price - self.price) / self.old_price) * 100)
            self.is_on_sale = True
        else:
            self.discount_percentage = 0
            self.is_on_sale = False
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    """Additional product images"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    # store an external or CDN URL to the gallery image
    image = models.URLField(max_length=500, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.product.title} - Image {self.sort_order}"


class ProductVariant(models.Model):
    """Product variants for different colors, sizes, etc."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    color = models.ForeignKey(Color, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=50, blank=True)  # e.g., "S", "M", "L" or "3-Seater", "2-Seater"
    pattern = models.CharField(max_length=100, blank=True)  # e.g., "Classic", "Modern"
    
    # Variant-specific pricing (optional, inherits from product if not set)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Stock management
    stock_quantity = models.PositiveIntegerField(default=0)
    is_in_stock = models.BooleanField(default=True)
    
    # Variant-specific image
    # store an external or CDN URL to the variant image
    image = models.URLField(max_length=500, blank=True, null=True)
    
    # Display
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['product', 'color', 'size', 'pattern']
        ordering = ['color__name', 'size', 'pattern']

    def save(self, *args, **kwargs):
        # Inherit pricing from product if not set
        if not self.price:
            self.price = self.product.price
        if not self.old_price:
            self.old_price = self.product.old_price
            
        # Update stock status
        self.is_in_stock = self.stock_quantity > 0
        super().save(*args, **kwargs)

    def __str__(self):
        variant_parts = [self.color.name]
        if self.size:
            variant_parts.append(self.size)
        if self.pattern:
            variant_parts.append(self.pattern)
        return f"{self.product.title} - {' '.join(variant_parts)}"


class ProductReview(models.Model):
    """Product reviews and ratings"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='product_reviews')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['product', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.title} - {self.rating} stars"


class ProductRecommendation(models.Model):
    """Product recommendations for 'Buy with it' and 'Inspired by' sections"""
    RECOMMENDATION_TYPES = [
        ('buy_with', 'Buy with it'),
        ('inspired_by', 'Inspired by browsing history'),
        ('frequently_viewed', 'Frequently viewed'),
        ('similar', 'Similar products'),
        ('recommended', 'Recommended for you'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recommendations')
    recommended_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recommended_by')
    recommendation_type = models.CharField(max_length=20, choices=RECOMMENDATION_TYPES)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'recommended_product', 'recommendation_type']
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return f"{self.product.title} -> {self.recommended_product.title} ({self.recommendation_type})"


class ProductSpecification(models.Model):
    """Product specifications and key details"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    name = models.CharField(max_length=100)  # e.g., "Brand", "Depth", "Style"
    value = models.CharField(max_length=200)  # e.g., "Atomberg", "12 inch", "Modern"
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return f"{self.product.title} - {self.name}: {self.value}"


class ProductFeature(models.Model):
    """Product features for 'About This Item' section"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='features')
    feature = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.product.title} - {self.feature[:50]}..."


class ProductOffer(models.Model):
    """Product offers and promotions"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='offers')
    title = models.CharField(max_length=200)
    description = models.TextField()
    discount_percentage = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(100)])
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.title} - {self.title}"


class Discount(models.Model):
    """Predefined discount options (e.g., 10%, 20%, 30%, 50%)"""
    percentage = models.PositiveIntegerField(unique=True, validators=[MaxValueValidator(100)])
    label = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['percentage']

    def save(self, *args, **kwargs):
        if not self.label:
            self.label = f"{self.percentage}%"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.percentage}%"