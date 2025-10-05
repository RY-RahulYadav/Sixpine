from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
import random
import string


class OTPVerification(models.Model):
    """Model to store OTP for email verification during registration"""
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    
    # Store registration data temporarily
    username = models.CharField(max_length=150)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    password_hash = models.CharField(max_length=255)
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.is_expired() and not self.is_verified and self.attempts < 5
    
    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    def __str__(self):
        return f"OTP for {self.email}"
    
    class Meta:
        verbose_name = "OTP Verification"
        verbose_name_plural = "OTP Verifications"


class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Preferences
    newsletter_subscription = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profile when user is created"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save user profile when user is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()
