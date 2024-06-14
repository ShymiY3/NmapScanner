from rest_framework.permissions import BasePermission, IsAuthenticated
from .models import NmapFlag, UserNmapFlagPermission
from rest_framework.permissions import IsAdminUser, SAFE_METHODS

def combine_to_multipart(f:list):
    flags = []
    current = []
    for part in f:
        part = str(part)
        if not part: continue
        if part.startswith('-'):
            if current:
                flags.append(' '.join(current))
            current = [part]
        else: current.append(part)
    if current:
        flags.append(' '.join(current))    
    return flags


class HasNmapFlagPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        flags = request.data.get('flags', [])
        
        # Combine multi-part flags into single strings
        combined_flags = combine_to_multipart(flags)
        
        allowed_flags = []
        banned_flags = []
        allow_all = getattr(user, 'allow_all', False)

        for flag in combined_flags:
            
            flag_name = flag.split()[0]
            try:
                nmap_flag = NmapFlag.objects.get(flag=flag_name)
            except NmapFlag.DoesNotExist:
                banned_flags.append(flag)
                continue

            permission = UserNmapFlagPermission.objects.filter(user=user, flag=nmap_flag).first()

            if allow_all:
                # If allow_all is True, check only for explicitly banned flags
                if permission and not permission.is_allowed:
                    banned_flags.append(flag)
            else:
                # If allow_all is False, check both allowed and banned flags
                if permission and permission.is_allowed:
                    allowed_flags.append(flag)
                elif permission and not permission.is_allowed:
                    banned_flags.append(flag)
                else:
                    banned_flags.append(flag)  # If no specific permission, treat as banned

        if banned_flags:
            self.message = f"Permission denied for flags: {', '.join(banned_flags)}"
            return False

        return True

class HasSudoPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        with_sudo = request.data.get('with_sudo', False)
        
        if with_sudo:
            if user.allow_sudo:
                return True
            self.message = f"Permission denied for with_sudo"
            return False
        return True
        

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser:
            return True
        elif hasattr(obj, 'owner') and obj.owner == user:
            return True
        else:
            return False
        


class IsAdminOrReadOnly(IsAdminUser):
    def has_permission(self, request, view):
        is_admin = super().has_permission(request, view)
        return request.method in SAFE_METHODS or is_admin