from rest_framework.permissions import BasePermission, IsAuthenticated

class IsValidUser(IsAuthenticated):
    def has_permission(self, request, view):
        if super().has_permission(request, view):
            self.message = "User must change password"
            if not request.user.must_change_password:
                return True

        return False


class IsSelfOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.is_superuser