from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTPVerification, PasswordResetToken, ContactQuery, BulkOrder


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('is_verified', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'first_name', 'last_name', 'mobile')}),
        ('Permissions', {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    """OTP Verification admin"""
    list_display = ('email', 'mobile', 'otp_method', 'is_verified', 'is_used', 'created_at', 'expires_at')
    list_filter = ('otp_method', 'is_verified', 'is_used', 'created_at')
    search_fields = ('email', 'mobile', 'otp_code')
    readonly_fields = ('otp_code', 'created_at', 'expires_at')
    ordering = ('-created_at',)


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Password Reset Token admin"""
    list_display = ('user', 'is_used', 'created_at', 'expires_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__email', 'user__username', 'token')
    readonly_fields = ('token', 'created_at', 'expires_at')
    ordering = ('-created_at',)


@admin.register(ContactQuery)
class ContactQueryAdmin(admin.ModelAdmin):
    """Contact Query admin"""
    list_display = ('full_name', 'phone_number', 'email', 'pincode', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('full_name', 'phone_number', 'email', 'pincode')
    readonly_fields = ('created_at', 'updated_at', 'resolved_at')
    ordering = ('-created_at',)
    list_editable = ('status',)


@admin.register(BulkOrder)
class BulkOrderAdmin(admin.ModelAdmin):
    """Bulk Order admin"""
    list_display = ('company_name', 'contact_person', 'email', 'project_type', 'status', 'created_at')
    list_filter = ('status', 'project_type', 'created_at')
    search_fields = ('company_name', 'contact_person', 'email', 'phone_number')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    list_editable = ('status',)
