from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, OTPVerification, PasswordResetToken, ContactQuery, BulkOrder, PaymentPreference, SavedCard


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'mobile', 'password', 'password_confirm')
        extra_kwargs = {
            'username': {'required': False},
            'mobile': {'required': False},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        
        # Auto-generate username from email if not provided
        if not attrs.get('username'):
            attrs['username'] = attrs['email'].split('@')[0]
        
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value
    
    def validate_username(self, value):
        if value and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists")
        return value


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = None
            
            # Try to authenticate with email first (since email is our primary identifier)
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                # Try with username if email failed
                user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Must include username and password")


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'mobile', 'is_verified', 'is_staff', 'is_superuser', 'date_joined')
        read_only_fields = ('id', 'is_verified', 'is_staff', 'is_superuser', 'date_joined')


class OTPRequestSerializer(serializers.Serializer):
    """Serializer for requesting OTP"""
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField(required=False, allow_blank=True)
    mobile = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField()
    password_confirm = serializers.CharField()
    otp_method = serializers.ChoiceField(choices=['email', 'whatsapp'])
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        if attrs['otp_method'] == 'whatsapp' and not attrs.get('mobile'):
            raise serializers.ValidationError("Mobile number is required for WhatsApp verification")
        
        return attrs


class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits")
        return value


class OTPResendSerializer(serializers.Serializer):
    """Serializer for resending OTP"""
    email = serializers.EmailField()
    otp_method = serializers.ChoiceField(choices=['email', 'whatsapp'])


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate password strength
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': e.messages})
        
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate password strength
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': e.messages})
        
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class ContactQuerySerializer(serializers.ModelSerializer):
    """Serializer for contact form submissions"""
    class Meta:
        model = ContactQuery
        fields = ['id', 'full_name', 'pincode', 'phone_number', 'email', 'message', 
                  'status', 'admin_notes', 'created_at', 'updated_at', 'resolved_at']
        read_only_fields = ['id', 'status', 'admin_notes', 'created_at', 'updated_at', 'resolved_at']


class ContactQueryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contact queries (user submission)"""
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    message = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = ContactQuery
        fields = ['full_name', 'pincode', 'phone_number', 'email', 'message']
    
    def validate_email(self, value):
        """Convert empty string to None"""
        return value if value else None
    
    def validate_message(self, value):
        """Convert empty string to None"""
        return value if value else None


class BulkOrderSerializer(serializers.ModelSerializer):
    """Serializer for bulk orders"""
    assigned_to_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BulkOrder
        fields = ['id', 'company_name', 'contact_person', 'email', 'phone_number', 
                  'address', 'city', 'state', 'pincode', 'country', 'project_type',
                  'estimated_quantity', 'estimated_budget', 'delivery_date',
                  'special_requirements', 'status', 'admin_notes', 'quoted_price',
                  'assigned_to', 'assigned_to_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'admin_notes', 'quoted_price', 'assigned_to', 'created_at', 'updated_at']
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.email
        return None


class BulkOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bulk orders (user submission)"""
    estimated_quantity = serializers.IntegerField(required=False, allow_null=True)
    estimated_budget = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    delivery_date = serializers.DateField(required=False, allow_null=True)
    special_requirements = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    country = serializers.CharField(required=False, default='India')
    
    class Meta:
        model = BulkOrder
        fields = ['company_name', 'contact_person', 'email', 'phone_number', 
                  'address', 'city', 'state', 'pincode', 'country', 'project_type',
                  'estimated_quantity', 'estimated_budget', 'delivery_date',
                  'special_requirements']
    
    def validate_estimated_quantity(self, value):
        """Convert empty string or zero to None"""
        return value if value else None
    
    def validate_estimated_budget(self, value):
        """Convert empty string or zero to None"""
        return value if value else None
    
    def validate_special_requirements(self, value):
        """Convert empty string to None"""
        return value if value else None


class PaymentPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for payment preferences - address is managed via Address table"""
    
    class Meta:
        model = PaymentPreference
        fields = [
            'id', 'preferred_method', 'preferred_card_token_id', 
            'razorpay_customer_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'razorpay_customer_id', 'created_at', 'updated_at']


class SavedCardSerializer(serializers.ModelSerializer):
    """Serializer for saved cards"""
    class Meta:
        model = SavedCard
        fields = [
            'id', 'token_id', 'customer_id', 'card_last4', 'card_network',
            'card_type', 'card_issuer', 'nickname', 'is_default',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
