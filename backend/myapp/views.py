from django.views.generic import TemplateView
from rest_framework import viewsets
from .models import Notification, User, Profile, Post
from .serializers import NotificationSerializer, UserSerializer, ProfileSerializer, PostSerializer, LikeSerializer
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes, api_view, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import SkipAuth
from rest_framework.authentication import BasicAuthentication

class IndexView(TemplateView):
    template_name = 'index.html'


class ProfileListView(TemplateView):
    template_name = 'profile_list.html'

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
    @authentication_classes([SkipAuth])
    @permission_classes([SkipAuth])
    def notifications(self, request, pk=None):
        notification = Notification.objects.filter(user_id=pk)
        serializer = NotificationSerializer(notification, many=True)
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
    def posts(self, request, pk=None):
        #profile = Profile.objects.get(user_id=pk)
        #posts = Post.objects.filter(created_by_user=profile.id)
        #serializer = PostSerializer(posts, many=True)
        posts = User.objects.get(id=pk).posts.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    @permission_classes([SkipAuth])
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

