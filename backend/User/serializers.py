from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser
from API.models import NmapFlag, UserNmapFlagPermission
from rest_framework import serializers


class RegularUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'allow_all', 'allow_sudo', 'is_superuser', 'must_change_password']
        read_only_fields = ['id', 'username', 'allow_all', 'allow_sudo', 'is_superuser', 'must_change_password']

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'allow_all', 'allow_sudo', 'must_change_password', 'is_superuser']
        read_only_fields = ['id', 'is_superuser']

class CustomUserCreateSerializer(serializers.ModelSerializer):
    OTP = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'OTP', 'allow_all', 'allow_sudo', 'must_change_password', 'is_superuser']
        read_only_fields = ['id', 'must_change_password', 'is_superuser', 'OTP']
        
    def get_OTP(self, obj):
        return hasattr(obj, 'otp') and obj.otp
        
    def validate_email(self, value):
        """
        Check that the email is not already in use.
        """
        if not value:
            return value
        
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """
        Check that the username is not already in use.
        """
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        OTP = CustomUser.objects.make_random_password(32)
        user = CustomUser(**validated_data)
        user.set_password(OTP)
        user.save()
        
        user.otp = OTP
        return user

    
class ResetPasswordSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    user_name = serializers.SerializerMethodField()
    OTP = serializers.SerializerMethodField()

    def get_OTP(self, obj):
        return obj['user'].OTP

    def get_user_name(self, obj):
        return obj['user'].username

    def update(self, instance, validated_data):
        OTP = CustomUser.objects.make_random_password(32)
        instance.set_password(OTP)
        instance.must_change_password = True
        instance.save()
        
        instance.OTP = OTP
        return instance

    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({"old_password": "Old password is not correct"})
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "New passwords do not match"})
        validate_password(data['new_password'], user)
        return data