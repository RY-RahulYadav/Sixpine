from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, OTPVerification


class OTPRequestSerializer(serializers.Serializer):
    """Serializer for requesting OTP"""
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        
        # Check if username already exists
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists"})
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already registered"})
        
        return attrs


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for verifying OTP and creating user"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone', 'date_of_birth', 'gender', 'avatar', 'newsletter_subscription', 
                 'sms_notifications', 'email_notifications', 'full_name']
        read_only_fields = ['full_name']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined', 'profile']
        read_only_fields = ['id', 'date_joined', 'is_staff']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs