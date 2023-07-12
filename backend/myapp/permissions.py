from rest_framework.permissions import BasePermission
from rest_framework import permissions

class IsUserRegisterOrIsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method == "POST":
            return True
        
        return request.user and request.user.is_authenticated
    

class SkipAuth(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return True