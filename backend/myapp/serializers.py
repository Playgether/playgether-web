from urllib.parse import urljoin
from rest_framework import serializers
from myapp.models import Profile, Notification, Post, Like, Comment, Repost, PostMedia
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from .functions import clean_email_implementation, clean_first_name_implementation, clean_last_name_implementation, clean_password_implementation, clean_username_implementation
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.contenttypes.models import ContentType

# atribute_name = ModelSerializerName(many=True, read_only=True) to add the entire object inside another object
# atribute_name = serializers.PrimaryKeyRelatedField(many=True, read_only=True) to add just a primary key off the object inside another object
# atribute_name = serializers.HyperLinkedRelatedField(many=True, read_only=True, view_name='some atributte off the object') to add a link off the object inside another object

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)


        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name

        return token

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
    def validate_password(self, value):
        return clean_password_implementation(value)

    def validate_email(self, value):
        return clean_email_implementation(value)
    
    def validate_first_name(self, value):
        return clean_first_name_implementation(value)
    
    def validate_last_name(self, value):
        return clean_last_name_implementation(value)

    def validate_username(self, value):
        return clean_username_implementation(value)

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
    actor_name = serializers.SerializerMethodField()
    actor_profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            'user',
            'is_read',
            'message',
            'timestamp',
            'actor_name',
            'actor_profile_photo'
        )

    def get_actor_profile_photo(self, obj):
        request = self.context.get('request')
        if obj.actor.profile.profile_photo:
            return request.build_absolute_uri(obj.actor.profile.profile_photo.url)
        else:
            return None
        
    def get_actor_name(self, obj):
        name = obj.actor.first_name + " " + obj.actor.last_name
        return name




class PostSerializer(serializers.ModelSerializer):
    created_by_user_name = serializers.ReadOnlyField(source='created_by_user.username')
    created_by_user_photo = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    reposts = serializers.SerializerMethodField()
    medias = serializers.SerializerMethodField()
    user_already_like = serializers.SerializerMethodField()


    def get_user_already_like(self, obj):
        user = self.context['request'].user
        likes = Like.objects.filter(object_id=obj.id)
        like_object = likes.filter(user=user).exists()
        if like_object:
            return True
        else:
            return False

    def get_created_by_user_photo(self, obj):
        request = self.context.get('request')
        if obj.created_by_user.profile.profile_photo:
            return request.build_absolute_uri(obj.created_by_user.profile.profile_photo.url)
        else:
            return None


    def get_reposts(self, obj):
        try:
            request = self.context.get('request')
            reposts = Repost.objects.filter(object_id=obj.id).order_by('-timestamp')
            reposts_serializer = RepostSerializer(reposts, many=True, context={'request': request})
            return reposts_serializer.data
        except Repost.DoesNotExist:
            return []
        
    def get_medias(self, obj):
        request = self.context.get('request')
        medias = obj.medias.all().order_by('position')
        return PostMediaSerializer(medias, many=True, context={'request': request}).data   
     
    def get_likes(self, obj):
        try:
            request = self.context.get('request')
            likes = Like.objects.filter(object_id=obj.id).order_by('-timestamp')
            likes_serializer = LikeSerializer(likes, many=True, context={'request': request})
            return likes_serializer.data
        except Like.DoesNotExist:
            []
    
    def get_comments(self, obj):
        try:
            request = self.context.get('request')
            comments = Comment.objects.filter(object_id=obj.id).order_by('-timestamp')
            comment_serializer = CommentSerializer(comments, many=True, context={'request': request})
            return comment_serializer.data
        except Comment.DoesNotExist:
            return None

        
    class Meta:
        model = Post
        fields = (
            '__all__'
        )


class CommentSerializer(serializers.ModelSerializer):
    created_by_user_name = serializers.ReadOnlyField(source='user.username')
    created_by_user_photo = serializers.SerializerMethodField()
    comments_of_comments = serializers.SerializerMethodField()
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(),
        slug_field='model',
    )
    user_already_like = serializers.SerializerMethodField()

    def get_user_already_like(self, obj):
        user = self.context['request'].user
        likes = Like.objects.filter(object_id=obj.id)
        return likes.filter(user=user).exists()

    def get_created_by_user_photo(self, obj):
        request = self.context.get('request')
        if obj.user.profile.profile_photo:
            return request.build_absolute_uri(obj.user.profile.profile_photo.url)
        return None

    def get_comments_of_comments(self, obj):
        try:
            depth = self.context.get('depth', 1) 
            if depth <= 0:
                return [] 
            
            request = self.context.get('request')
            comments = Comment.objects.filter(object_id=obj.id)
            comment_serializer = CommentSerializer(
                comments, 
                many=True, 
                context={'request': request, 'depth': depth - 1}
            )
            return comment_serializer.data
        except Comment.DoesNotExist:
            return []
        
    class Meta:
        model = Comment
        fields = '__all__'

    def to_representation(self, instance):
        data = super(CommentSerializer, self).to_representation(instance)
        return data

class LikeSerializer(serializers.ModelSerializer):
    created_by_user_name = serializers.ReadOnlyField(source='user.username')
    created_by_user_photo = serializers.SerializerMethodField()
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(),
        slug_field='model',
    )

    def get_created_by_user_photo(self, obj):
        request = self.context.get('request')
        if obj.user.profile.profile_photo:
            return request.build_absolute_uri(obj.user.profile.profile_photo.url)
        else:
            return None

    class Meta:
        model = Like
        fields = (
            '__all__' 
        )

class RepostSerializer(serializers.ModelSerializer):
    created_by_user_name = serializers.ReadOnlyField(source='user.username')
    created_by_user_photo = serializers.SerializerMethodField()
    user_already_like = serializers.SerializerMethodField()


    def get_user_already_like(self, obj):
        user = self.context['request'].user
        likes = Like.objects.filter(object_id=obj.id)
        like_object = likes.filter(user=user).exists()
        if like_object:
            return True
        else:
            return False

    def get_created_by_user_photo(self, obj):
        request = self.context.get('request')
        if obj.user.profile.profile_photo:
            return request.build_absolute_uri(obj.user.profile.profile_photo.url)
        else:
            return None

    class Meta:
        model = Repost
        fields = (
            '__all__' 
        )

class PostMediaSerializer(serializers.ModelSerializer):
    media_file = serializers.SerializerMethodField()

    def get_media_file(self, obj):
        request = self.context.get('request')
        base_url = request.build_absolute_uri("/")
        media_url = obj.media_file.url
        
        full_url = urljoin(base_url, media_url)
        return full_url

    class Meta:
        model = PostMedia
        fields = (
            '__all__'
        )

