from django.contrib import admin
from .models import GlobalSettings, AdminLog, AdminDashboardSetting


@admin.register(GlobalSettings)
class GlobalSettingsAdmin(admin.ModelAdmin):
    """Global Settings admin"""
    list_display = ('key', 'value', 'description', 'updated_at')
    search_fields = ('key', 'description')
    ordering = ('key',)


@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    """Admin Log admin"""
    list_display = ('user', 'action_type', 'model_name', 'object_repr', 'created_at')
    list_filter = ('action_type', 'model_name', 'created_at')
    search_fields = ('user__email', 'user__username', 'object_repr', 'model_name')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'


@admin.register(AdminDashboardSetting)
class AdminDashboardSettingAdmin(admin.ModelAdmin):
    """Admin Dashboard Setting admin"""
    list_display = ('user', 'layout_preference', 'theme_preference', 'show_notifications')
    search_fields = ('user__email', 'user__username')
    ordering = ('user',)
