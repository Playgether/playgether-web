from rest_framework import serializers
from myapp.models import Profile, Notification, Post, Like
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

# atribute_name = ModelSerializerName(many=True, read_only=True) to add the entire object inside another object
# atribute_name = serializers.PrimaryKeyRelatedField(many=True, read_only=True) to add just a primary key off the object inside another object
# atribute_name = serializers.HyperLinkedRelatedField(many=True, read_only=True, view_name='some atributte off the object') to add a link off the object inside another object


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    class Meta:
        model = User 
        fields = (
            'id',
            'username',
            'password',
            'first_name',
            'email',
            'date_joined',
            'last_login',
            'is_active',
            'last_name',
        )

class ProfileSerializer(serializers.ModelSerializer):
    #follows = serializers.HyperlinkedRelatedField(many=False, read_only=True, view_name='follows-detail')

    class Meta:
        model = Profile
        fields = (
            'id',
            'user',
            'bio',
            'profile_photo',
            'hours_played',
            'matches_played',
            'performance',
            'gamer_nivel',
            'verified',
            'quantity_comment',
            'quantity_likes',
            'follows'

        )


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = (
            'user',
            'is_read',
            'message',
            'timestamp'
        )

class PostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = (
            '__all__'
        )

class LikeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Like
        fields = (
            'user',
            'timestamp',
            'content_type'
        )
