from django.views.generic import TemplateView
from rest_framework import viewsets
from .models import Notification, User, Profile, Post, Comment
from .serializers import NotificationSerializer, UserSerializer, CommentSerializer, ProfileSerializer, PostSerializer, LikeSerializer, MyTokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import SkipAuth
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.contenttypes.models import ContentType

  
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    

class IndexView(TemplateView):
    template_name = 'index.html'


class PostsViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=True, methods=['get', 'post'])
    def feed(self, request, pk=None):
        following = Profile.objects.get(user_id=pk).follows.exclude(user_id=pk)
        ids_seguindo = [user.id for user in following]
        posts = Post.objects.filter(created_by_user__in=ids_seguindo).order_by("-timestamp")
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=True, methods=['get'])
    def profiles(self, request, pk=None):
        profile = Profile.objects.filter(user_id=pk)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'usernames':
            return [AllowAny()]

        if self.action == "create":
            return[AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['get'])
    def notifications(self, request, pk=None):
        notification = Notification.objects.filter(profile_id=pk)
        serializer = NotificationSerializer(notification, many=True).order_by('-timestamp')
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def following(self, request, pk=None):
        follows = Profile.objects.get(user_id=pk).follows.exclude(user_id=pk)
        serializer = ProfileSerializer(follows, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        followers = Profile.objects.get(user_id=pk).followed_by.exclude(user_id=pk)
        serializer = ProfileSerializer(followers, many=True)
        return Response(serializer.data)

    
    @action(detail=True, methods=['get'])
    def usernames(self, request, pk=None):
        is_username_exists = User.objects.filter(username=pk).exists()
        if is_username_exists :
            return Response(True)
        else:
            return Response(False)
        

    @action(detail=True, methods=['get'])
    def likes(self, request, pk=None):
        likes = User.objects.get(id=pk).likes.all()
        serializer = LikeSerializer(likes, many=True)
        return Response(serializer.data)

