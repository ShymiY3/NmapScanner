from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    HtmlView,
    UserViewSet,
    ScanViewSet,
    UserNmapFlagPermissionViewSet,
    ChangePasswordView,
    NmapFlagViewSet,
    ResetPasswordView,
    UserNmapFlagPermissionMeView
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"scan", ScanViewSet, basename="scan")
router.register(r"flag", NmapFlagViewSet, basename="flag")
router.register(
    r"flag-permissions", UserNmapFlagPermissionViewSet, basename="flag-permissions"
)

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("html/<uuid:id>", HtmlView.as_view(), name="html-view"),
    path("auth/", include("rest_framework.urls")),
    path(
        "users/change-password/", ChangePasswordView.as_view(), name="change-password"
    ),
    path(
        "users/reset-password/", ResetPasswordView.as_view(), name="reset-password"
    ),
    path(
        "flag-permissions/me/", UserNmapFlagPermissionMeView.as_view(), name="flag-permission-me"
    ),
    path("", include(router.urls)),  # Include the router's URLs
]
