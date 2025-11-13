from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    razorpay_customer_id = models.CharField(max_length=100, blank=True, null=True,
                                            help_text='Razorpay customer ID - created automatically on FIRST PAYMENT ATTEMPT (not at login), using user email, name, and phone')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Make username optional since we're using email as primary identifier
    username = models.CharField(max_length=150, blank=True, null=True, unique=True)
    
    # User preferences
    interests = models.JSONField(blank=True, default=list, help_text='User interests as a list of category names (strings)')
    advertising_enabled = models.BooleanField(default=True, help_text='Whether user wants to see personalized advertisements')
    
    # Communication preferences
    whatsapp_enabled = models.BooleanField(default=True, help_text='Whether user wants to receive WhatsApp notifications')
    whatsapp_order_updates = models.BooleanField(default=True, help_text='Receive WhatsApp notifications for order updates, shipments, payments and more')
    whatsapp_promotional = models.BooleanField(default=True, help_text='Receive WhatsApp notifications for personalised deals, recommendations, sales events, and more')
    email_promotional = models.BooleanField(default=True, help_text='Receive promotional emails')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return self.email


class OTPVerification(models.Model):
    """Model for OTP verification during registration"""
    OTP_METHOD_CHOICES = [
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    email = models.EmailField()
    mobile = models.CharField(max_length=15, blank=True, null=True)
    otp_code = models.CharField(max_length=6)
    otp_method = models.CharField(max_length=10, choices=OTP_METHOD_CHOICES)
    is_verified = models.BooleanField(default=False)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    user_data = models.JSONField(default=dict, blank=True)  # Store user data during registration
    
    class Meta:
        db_table = 'otp_verification'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.email} - {self.otp_method}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at


class PasswordResetToken(models.Model):
    """Model for password reset tokens"""
    token = models.CharField(max_length=100, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'password_reset_token'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reset token for {self.user.email}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @classmethod
    def generate_token(cls):
        return str(uuid.uuid4())


class ContactQuery(models.Model):
    """Model for storing contact form submissions"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    full_name = models.CharField(max_length=200)
    pincode = models.CharField(max_length=10)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'contact_queries'
        ordering = ['-created_at']
        verbose_name = 'Contact Query'
        verbose_name_plural = 'Contact Queries'
    
    def __str__(self):
        return f"{self.full_name} - {self.phone_number} ({self.status})"


class BulkOrder(models.Model):
    """Model for bulk order inquiries"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Under Review'),
        ('quoted', 'Quoted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    # Customer Information
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='India')
    
    # Order Details
    project_type = models.CharField(max_length=100)  # e.g., 'Corporate', 'Hospitality', 'Residential'
    estimated_quantity = models.IntegerField(blank=True, null=True)
    estimated_budget = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    delivery_date = models.DateField(blank=True, null=True)
    special_requirements = models.TextField(blank=True, null=True)
    
    # Admin Fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    quoted_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='bulk_orders')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bulk_orders'
        ordering = ['-created_at']
        verbose_name = 'Bulk Order'
        verbose_name_plural = 'Bulk Orders'
    
    def __str__(self):
        return f"{self.company_name} - {self.contact_person} ({self.status})"


class SavedCard(models.Model):
    """Store saved card information with token_id and card details"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_cards')
    token_id = models.CharField(max_length=100, unique=True, help_text='Razorpay token ID')
    customer_id = models.CharField(max_length=100, help_text='Razorpay customer ID')
    card_last4 = models.CharField(max_length=4, help_text='Last 4 digits of card')
    card_network = models.CharField(max_length=20, blank=True, help_text='Card network (Visa, Mastercard, etc.)')
    card_type = models.CharField(max_length=20, blank=True, help_text='Card type (credit, debit)')
    card_issuer = models.CharField(max_length=100, blank=True, help_text='Card issuer bank name')
    nickname = models.CharField(max_length=100, blank=True, help_text='User nickname for this card')
    is_default = models.BooleanField(default=False, help_text='Is this the default card?')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'saved_cards'
        verbose_name = 'Saved Card'
        verbose_name_plural = 'Saved Cards'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.card_network} ****{self.card_last4}"


class PaymentPreference(models.Model):
    """Store user payment preferences - NO card details, only references to Razorpay tokens"""
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Credit/Debit Card'),
        ('netbanking', 'Net Banking'),
        ('upi', 'UPI'),
        ('cod', 'Cash on Delivery'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='payment_preference')
    preferred_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='card')
    preferred_card_token_id = models.CharField(max_length=100, blank=True, null=True, 
                                                help_text='Razorpay token ID - card details stored only in Razorpay')
    razorpay_customer_id = models.CharField(max_length=100, blank=True, null=True,
                                            help_text='Razorpay customer ID for fetching saved cards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_preferences'
        verbose_name = 'Payment Preference'
        verbose_name_plural = 'Payment Preferences'
    
    def __str__(self):
        return f"{self.user.email} - {self.get_preferred_method_display()}"


class DataRequest(models.Model):
    """Model for user data export requests"""
    REQUEST_TYPE_CHOICES = [
        ('orders', 'Your Orders'),
        ('addresses', 'Your Addresses'),
        ('payment_options', 'Payment Options'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data_requests')
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    file_path = models.CharField(max_length=500, blank=True, null=True, help_text='Path to generated Excel file')
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='approved_data_requests')
    completed_at = models.DateTimeField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'data_requests'
        ordering = ['-requested_at']
        verbose_name = 'Data Request'
        verbose_name_plural = 'Data Requests'
    
    def __str__(self):
        return f"{self.user.email} - {self.get_request_type_display()} ({self.status})"