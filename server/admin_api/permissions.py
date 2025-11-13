from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    Now requires superuser for super admin panel.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff and request.user.is_superuser)