from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from .models import NmapFlag, Scan, ScanTag, UserNmapFlagPermission
from User.models import CustomUser
class StringArrayField(serializers.ListField):
    def to_representation(self, obj):
        
        # convert list to string
        return "".join([str(element) for element in obj])


class NmapFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = NmapFlag
        fields = ['id', 'flag', 'description']
        
        def validate_flag(self, value):
            if not value.startswith('-'):
                raise serializers.ValidationError('Flag must start with "-"')
            return value

class ScanResultTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanTag
        fields = ['id', 'tag']
        read_only_field = ['id']

class ScanSerializerList(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    tags = ScanResultTagSerializer(many=True, required=False)
    
    class Meta:
        model = Scan
        fields = ['id', 'target', 'flags', 'with_sudo', 'status', 'owner', 'owner_name', 'start_date', 'error', 'tags']
        read_only_fields = ['id', 'target', 'flags', 'with_sudo', 'status', 'owner', 'owner_name', 'start_date', 'error', 'tags']

    def get_owner_name(self, obj):
        return obj.owner.username

class ScanSerializerDetail(serializers.ModelSerializer):
    tags = ScanResultTagSerializer(many=True, required=False)
    owner_name = serializers.SerializerMethodField()

    
    class Meta:
        model = Scan
        fields = ['id', 'target', 'flags', 'with_sudo', 'status', 'owner', 'owner_name', 'start_date', 'result_html', 'error','note', 'tags']
        read_only_fields = ['id', 'target', 'flags', 'with_sudo', 'start_date', 'status', 'owner', 'error', 'result_html']

    def get_owner_name(self, obj):
        return obj.owner.username

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        instance.note = validated_data.get('note', instance.note)
        instance.save()

        if tags_data is not None:
            # Clear existing tags
            instance.tags.all().delete()

            # Add new tags
            for tag_data in tags_data:
                ScanTag.objects.create(scan_result=instance, **tag_data)

        return instance


class ScanCreateSerializer(serializers.ModelSerializer):
    tags = ScanResultTagSerializer(many=True, required=False)
    flags = StringArrayField(child=serializers.CharField(), required=False) 
    owner_name = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Scan
        fields = ['id', 'target', 'flags', 'with_sudo', 'status', 'owner', 'owner_name', 'start_date', 'note', 'tags']
        read_only_fields = ['id', 'start_date', 'status', 'owner']
    
    def get_owner_name(self, obj):
        return obj.owner.username
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        flags_data = validated_data.pop('flags', [])
        validated_data['flags'] = ' '.join(flags_data)
        scan_result = Scan.objects.create(**validated_data)
        for tag_data in tags_data:
            ScanTag.objects.create(scan_result=scan_result, **tag_data)
        return scan_result
    

class UserNmapFlagPermissionSerializer(serializers.ModelSerializer):
    flag = NmapFlagSerializer(read_only=True)
    user_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = UserNmapFlagPermission
        fields = ['id', 'user', 'user_name',  'flag', 'is_allowed']
        read_only_fields = ['id', 'user', 'user_name', 'flag']

    
    def get_user_name(self, obj):
        return obj.user.username

class UserNmapFlagPermissionCreateSerializer(serializers.ModelSerializer):
    flag = NmapFlagSerializer(read_only=True)
    user_name = serializers.SerializerMethodField(read_only=True)
    flag_id = serializers.PrimaryKeyRelatedField(queryset=NmapFlag.objects.all(), source='flag', write_only=True)

    
    class Meta:
        model = UserNmapFlagPermission
        fields = ['id', 'user', 'user_name', 'flag_id', 'flag', 'is_allowed']
        read_only_fields = ['id', 'user_name', 'flag']
    
    def get_user_name(self, obj):
        return obj.user.username

    def create(self, validated_data):
        user = validated_data.get('user')
        flag = validated_data.get('flag')
        is_allowed = validated_data.get('is_allowed')

        try:
            # Check if the permission already exists
            permission = UserNmapFlagPermission.objects.get(user=user, flag=flag)
            # Update the existing permission
            permission.is_allowed = is_allowed
            permission.save()
            return permission
        except ObjectDoesNotExist:
            # Create a new permission if it does not exist
            return UserNmapFlagPermission.objects.create(**validated_data)
