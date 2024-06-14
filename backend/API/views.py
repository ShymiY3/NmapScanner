from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.serializers import BaseSerializer
from django.shortcuts import HttpResponse, get_object_or_404
from django.db.models.functions import Length
from .tasks import network_scan
from .models import Scan, NmapFlag, UserNmapFlagPermission
from .serializers import (
    ScanSerializerList,
    ScanSerializerDetail,
    ScanCreateSerializer,
    UserNmapFlagPermissionSerializer,
    UserNmapFlagPermissionCreateSerializer,
    NmapFlagSerializer,
)
from User.serializers import (
    CustomUserCreateSerializer,
    ChangePasswordSerializer,
    RegularUserSerializer,
    AdminUserSerializer,
    ResetPasswordSerializer,
)
from .permissions import (
    HasNmapFlagPermission,
    IsOwnerOrAdmin,
    HasSudoPermission,
    IsAdminOrReadOnly,
)
from User.permissions import IsValidUser, IsSelfOrAdmin
from User.models import CustomUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class ScanViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        qs = Scan.objects.all()
        user = self.request.user
        users = self.request.query_params.get("users")

        if self.action == "me":
            return qs.filter(owner=user).order_by('-start_date')

        if not user.is_superuser:
            return qs.filter(owner=user).order_by('-start_date')

        if users:
            splitted_users = users.split(",")
            qs = qs.filter(owner__id__in=splitted_users)

        return qs.order_by('-start_date')

    def get_serializer_class(self):
        if self.action == "create":
            return ScanCreateSerializer
        if self.action in  ('list', 'me'):
            return ScanSerializerList
        return ScanSerializerDetail

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsValidUser, HasNmapFlagPermission, HasSudoPermission]
        else:
            permission_classes = [IsValidUser, IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    @swagger_auto_schema(
        operation_description="Retrieve the logged-in user's scans. **Permissions required**: IsValidUser.",
        responses={
            200: ScanSerializerList
        }
    )
    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        return super().list(request)

    @swagger_auto_schema(
        operation_description="Retrieve a list of scans. **Permissions required**: IsValidUser, IsOwnerOrAdmin.",
        responses={200: ScanSerializerList(many=True)},
        manual_parameters=[
            openapi.Parameter(
                "users",
                openapi.IN_QUERY,
                description="Comma-separated list of user IDs to filter the scans by owner",
                type=openapi.TYPE_STRING,
            )
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a scan by ID. **Permissions required**: IsValidUser, IsOwnerOrAdmin.",
        responses={200: ScanSerializerDetail, 404: "Not Found"},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new scan. **Permissions required**: IsValidUser, HasNmapFlagPermission, HasSudoPermission.",
        request_body=ScanCreateSerializer,
        responses={201: ScanCreateSerializer, 400: "Bad Request"},
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        scan = serializer.save(owner=request.user, status="PENDING")
        data = serializer.validated_data
        target = data.get("target")
        flags = data.get("flags", [])
        with_sudo = data.get("with_sudo")

        command = ["./nmap_wrapper.sh", *flags, target]
        if with_sudo:
            command.insert(0, "sudo")

        network_scan.apply_async((scan.id, command), task_id=str(scan.id))
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_description="Update a scan. **Permissions required**: IsValidUser, IsOwnerOrAdmin.",
        request_body=ScanSerializerDetail,
        responses={200: ScanSerializerDetail, 400: "Bad Request", 404: "Not Found"},
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a scan. **Permissions required**: IsValidUser, IsOwnerOrAdmin.",
        request_body=ScanSerializerDetail,
        responses={200: ScanSerializerDetail, 400: "Bad Request", 404: "Not Found"},
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a scan. **Permissions required**: IsValidUser, IsOwnerOrAdmin.",
        responses={204: "No Content", 404: "Not Found"},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class HtmlView(GenericAPIView):
    permission_classes = [IsValidUser, IsOwnerOrAdmin]
    swagger_schema = None
    
    def get(self, request, id):
        """
        Retrieve the HTML result of a scan by its ID.
        """
        scan = get_object_or_404(Scan, id=id)
        self.check_object_permissions(request, scan)
        return HttpResponse(scan.result_html, content_type="text/html")


class UserViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        qs = CustomUser.objects.all()
        user = self.request.user
        is_me = self.request.query_params.get("me")
        usernames = self.request.query_params.get("usernames")
        if not user.is_superuser:
            return qs.filter(id=user.id)
        if usernames:
            splitted_usernames = usernames.split(",")
            qs = qs.filter(username__in=splitted_usernames)
        return qs

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsValidUser, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated, IsSelfOrAdmin]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == "create":
            return CustomUserCreateSerializer
        if self.request.user.is_superuser:
            return AdminUserSerializer
        return RegularUserSerializer

    @swagger_auto_schema(
        operation_description="Retrieve the logged-in user's information. **Permissions required**: IsAuthenticated.",
        responses={
            200: openapi.Response(
                description="Admin user",
                schema=AdminUserSerializer(),
            ),
            200: openapi.Response(
                description="Regular user",
                schema=RegularUserSerializer(),
            ),
        },
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        serializer_class=RegularUserSerializer,
    )
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Retrieve a list of users. **Permissions required**: IsValidUser, IsSelfOrAdmin.",
        responses={
            200: openapi.Response(
                description="Admin user list",
                schema=AdminUserSerializer(many=True),
            ),
            200: openapi.Response(
                description="Regular user list",
                schema=RegularUserSerializer(many=True),
            ),
        },
        manual_parameters=[
            openapi.Parameter(
                "usernames",
                openapi.IN_QUERY,
                description="Comma-separated list of user names to filter the user query",
                type=openapi.TYPE_STRING,
            )
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a user by ID. **Permissions required**: IsValidUser, IsSelfOrAdmin.",
        responses={
            200: openapi.Response(
                description="Admin user",
                schema=AdminUserSerializer(),
            ),
            200: openapi.Response(
                description="Regular user",
                schema=RegularUserSerializer(),
            ),
            404: "Not Found",
        },
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new user. **Permissions required**: IsValidUser, IsAdminUser.",
        request_body=CustomUserCreateSerializer,
        responses={201: CustomUserCreateSerializer, 400: "Bad Request"},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update a user. **Permissions required**: IsValidUser, IsSelfOrAdmin. **Note**: Users can only update their email.",
        request_body=AdminUserSerializer,
        responses={
            200: openapi.Response(
                description="Admin user",
                schema=AdminUserSerializer(),
            ),
            200: openapi.Response(
                description="Regular user",
                schema=RegularUserSerializer(),
            ),
            400: "Bad Request",
            404: "Not Found",
        },
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a user. **Permissions required**: IsValidUser, IsSelfOrAdmin. **Note**: Users can only update their email.",
        request_body=AdminUserSerializer,
        responses={
            200: openapi.Response(
                description="Admin user",
                schema=AdminUserSerializer(),
            ),
            200: openapi.Response(
                description="Regular user",
                schema=RegularUserSerializer(),
            ),
            400: "Bad Request",
            404: "Not Found",
        },
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a user. **Permissions required**: IsValidUser, IsSelfOrAdmin.",
        responses={204: "No Content", 404: "Not Found"},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class ResetPasswordView(GenericAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ResetPasswordSerializer

    @swagger_auto_schema(
        operation_description="Reset the password for the specified user. **Permissions required**: IsAdmin.",
        request_body=ResetPasswordSerializer,
        responses={
            200: ResetPasswordSerializer,
            400: "Bad Request",
            403: "Forbidden",
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        serializer.update(user, serializer.validated_data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @swagger_auto_schema(
        operation_description="Change the password for the authenticated user. **Permissions required**: IsAuthenticated.",
        request_body=ChangePasswordSerializer,
        responses={
            200: openapi.Response(
                description="Password successfully changed",
                examples={"application/json": {"status": "password set"}},
            ),
            400: "Bad Request",
            403: "Forbidden",
        },
    )
    def post(self, request, *args, **kwargs):
        """
        Change the password for the authenticated user.
        """
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = request.user
        new_password = serializer.validated_data["new_password"]
        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        return Response({"status": "password set"}, status=status.HTTP_200_OK)


class UserNmapFlagPermissionViewSet(viewsets.ModelViewSet):

    def get_serializer_class(self):
        if self.action == "create":
            return UserNmapFlagPermissionCreateSerializer
        return UserNmapFlagPermissionSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [IsValidUser]
        else:
            permission_classes = [IsValidUser, IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        qs = UserNmapFlagPermission.objects.all()
        user = self.request.user
        users = self.request.query_params.get("users")
        flags = self.request.query_params.get('flags')
        if not user.is_superuser:
            return qs.filter(user=user)
        if users:
            splitted_users = users.split(",")
            qs = qs.filter(user__id__in=splitted_users)
        if flags:
            splitted_flags = flags.split(",")
            qs = qs.filter(flag__id__in=splitted_flags)
        return qs

    @swagger_auto_schema(
        operation_description="Retrieve a list of user Nmap flag permissions. **Permissions required**: IsValidUser.",
        responses={200: UserNmapFlagPermissionSerializer(many=True)},
        manual_parameters=[
            openapi.Parameter(
                "users",
                openapi.IN_QUERY,
                description="Comma-separated list of user IDs to filter the permissions by user",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "flags",
                openapi.IN_QUERY,
                description="Comma-separated list of flag IDs to filter the permissions by flag",
                type=openapi.TYPE_STRING,
            )
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a user Nmap flag permission by ID. **Permissions required**: IsValidUser.",
        responses={200: UserNmapFlagPermissionSerializer, 404: "Not Found"},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new user Nmap flag permission. **Permissions required**: IsValidUser, IsAdminUser.",
        request_body=UserNmapFlagPermissionCreateSerializer,
        responses={201: UserNmapFlagPermissionCreateSerializer, 400: "Bad Request"},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update a user Nmap flag permission. **Permissions required**: IsValidUser, IsAdminUser.",
        request_body=UserNmapFlagPermissionSerializer,
        responses={
            200: UserNmapFlagPermissionSerializer,
            400: "Bad Request",
            404: "Not Found",
        },
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a user Nmap flag permission. **Permissions required**: IsValidUser, IsAdminUser.",
        request_body=UserNmapFlagPermissionSerializer,
        responses={
            200: UserNmapFlagPermissionSerializer,
            400: "Bad Request",
            404: "Not Found",
        },
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a user Nmap flag permission. **Permissions required**: IsValidUser, IsAdminUser.",
        responses={204: "No Content", 404: "Not Found"},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class UserNmapFlagPermissionMeView(GenericAPIView):
    permission_classes = [IsValidUser]
    serializer_class = UserNmapFlagPermissionSerializer

    def get_queryset(self):
        qs = UserNmapFlagPermission.objects.all()
        user = self.request.user
        return qs.filter(user=user)

    @swagger_auto_schema(
        operation_description="Retrieve the Nmap flag permissions for the logged-in user. **Permissions required**: IsValidUser.",
        responses={
            200: openapi.Response(
                description="List of Nmap flag permissions",
                schema=UserNmapFlagPermissionSerializer(many=True),
            ),
            403: "Forbidden",
        },
    )
    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class NmapFlagViewSet(viewsets.ModelViewSet):
    serializer_class = NmapFlagSerializer
    permission_classes = [IsValidUser, IsAdminOrReadOnly]

    def get_queryset(self):
        qs = NmapFlag.objects.all()
        flags = self.request.query_params.get("flags")
        if flags:
            splitted_flags = flags.split(",")
            qs = qs.filter(flag__in=splitted_flags)
        qs = qs.order_by(Length("flag"))
        return qs

    @swagger_auto_schema(
        operation_description="Retrieve a list of Nmap flags. **Permissions required**: IsValidUser, IsAdminOrReadOnly.",
        responses={200: NmapFlagSerializer(many=True)},
        manual_parameters=[
            openapi.Parameter(
                "flags",
                openapi.IN_QUERY,
                description="Comma-separated list of flags to filter the Nmap flags",
                type=openapi.TYPE_STRING,
            )
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve an Nmap flag by ID. **Permissions required**: IsValidUser, IsAdminUser.",
        responses={200: NmapFlagSerializer, 404: "Not Found"},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new Nmap flag. **Permissions required**: IsValidUser, IsAdminUser.",
        request_body=NmapFlagSerializer,
        responses={201: NmapFlagSerializer, 400: "Bad Request"},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update an Nmap flag. **Permissions required**: IsValidUser, IsAdminUser.",
        request_body=NmapFlagSerializer,
        responses={200: NmapFlagSerializer, 400: "Bad Request", 404: "Not Found"},
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update an Nmap flag. **Permissions required**: IsValidUser, IsAdminUser.",
        request_body=NmapFlagSerializer,
        responses={200: NmapFlagSerializer, 400: "Bad Request", 404: "Not Found"},
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete an Nmap flag. **Permissions required**: IsValidUser, IsAdminUser.",
        responses={204: "No Content", 404: "Not Found"},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
