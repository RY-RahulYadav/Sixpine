from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, OTPVerification


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ['phone', 'date_of_birth', 'gender', 'avatar', 'newsletter_subscription', 'sms_notifications', 'email_notifications']


class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'date_of_birth', 'gender', 'created_at']
    list_filter = ['gender', 'newsletter_subscription', 'created_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'phone']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'otp', 'created_at', 'expires_at', 'is_verified', 'attempts']
    search_fields = ['email', 'username']
    list_filter = ['is_verified', 'created_at']
    readonly_fields = ['created_at', 'expires_at']
    
    def has_add_permission(self, request):
        # Prevent manual creation through admin
        return False
