import os
from django.http import JsonResponse
from django.views.generic import TemplateView
from dotenv import load_dotenv
import requests
from rest_framework import viewsets
from .models import Notification, User, Profile, Post, Comment, Like
from .serializers import NotificationSerializer, UserSerializer, CommentSerializer, ProfileSerializer, PostSerializer, LikeSerializer, MyTokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from games.serializers import ProfileGameLolSerializer, GameSerializer
from games.models import ProfileGameLol
from .functions import generate_data_lol
from .schema import (
    posts_schema,
    posts_schema_GET,
    posts_schema_POST,
    feed_schema,
    post_likes_schema_DELETE,
    post_likes_schema_GET,
    post_comments_schema,
    comments_schema,
    comments_schema_GET,
    comments_schema_POST,
    user_schema,
    profile_schema,
    likes_schema,
    users_schema_POST,
    profiles_schema_POST,
    likes_schema_POST,
    likes_schema_GET,
    users_schema_GET,
    profiles_schema_GET,
    profile_games_schema,
    profile_fetch_lol_schema,
    profile_info_lol_schema,
    profile_following_schema,
    profile_followers_schema,
    user_usernames,
    user_profile,
    user_notifications,
    user_likes,
)
  
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    

class IndexView(TemplateView):
    template_name = 'index.html'

@posts_schema
@posts_schema_GET
@posts_schema_POST
class PostsViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


    @feed_schema
    @action(detail=True, methods=['GET'])
    def feed(self, request, pk=None):
        profile = Profile.objects.get(pk=pk)
        following = profile.follows.exclude(pk=pk)
        posts = Post.objects.filter(created_by_user__profile__in=following).order_by("-timestamp")
        serializer = PostSerializer(posts, many=True, context={'request': request})   
        return Response(serializer.data)

    @post_likes_schema_GET
    @post_likes_schema_DELETE
    @action(detail=True, methods=['GET', 'DELETE'])
    def likes(self, request, pk=None):
        if request.method == 'GET':
            try:
                post = Post.objects.get(id=pk)
                likes = Like.objects.filter(object_id = post.id)
                serializer = LikeSerializer(likes, many=True, context={'request': request})
                return Response(serializer.data)
            except Post.DoesNotExist:
                return Response({"detail": "Post não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        elif request.method == 'DELETE':
            user = self.request.user
            try:
                like = Like.objects.get(object_id=pk, user=user)
                like.delete()
                return Response({"detail": "Like foi excluido com sucesso."}, status=status.HTTP_204_NO_CONTENT)
            except Like.DoesNotExist:
                return Response({"detail": "Like não encontrado."}, status=status.HTTP_404_NOT_FOUND)
    @post_comments_schema
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        comments = Comment.objects.filter(object_id=pk).order_by('-timestamp')
        comment_serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(comment_serializer.data)

@comments_schema
@comments_schema_GET
@comments_schema_POST
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

@likes_schema
@likes_schema_POST
@likes_schema_GET
class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

@profile_schema
@profiles_schema_POST
@profiles_schema_GET
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    
    @profile_following_schema
    @action(detail=True, methods=['GET'])
    def following(self, request, pk=None):
        follows = Profile.objects.get(pk=pk).follows.exclude(pk=pk)
        serializer = ProfileSerializer(follows, many=True)
        return Response(serializer.data)
    
    @profile_followers_schema
    @action(detail=True, methods=['GET'])
    def followers(self, request, pk=None):
        followers = Profile.objects.get(pk=pk).followed_by.exclude(pk=pk)
        serializer = ProfileSerializer(followers, many=True)
        return Response(serializer.data)

    @profile_games_schema
    @action(detail=True, methods=['GET'])
    def games(self, request, pk=None):
        profile = Profile.objects.get(user_id=pk)
        games = [pg.id_game for pg in profile.games.all()]
        serializer = GameSerializer(games, many=True, context={'request': request})
        return Response(serializer.data)
    @profile_info_lol_schema
    @action(detail=True, methods=['GET'], url_path='games/lol')
    def info_lol(self, request, pk=None):
        info = ProfileGameLol.objects.filter(id_profile=pk).first()
        
        if info is None:
            return Response([], status=status.HTTP_200_OK)
        
        serializer = ProfileGameLolSerializer(info)
        return Response(serializer.data)
    @profile_fetch_lol_schema
    @action(detail=True, methods=['GET'], url_path='games/fetch/lol')
    def fetch_lol(self, request, pk=None):
        profile_game_lol = ProfileGameLol.objects.filter(id_profile=pk).first()
        summonerId = profile_game_lol.summoner_id
        print(summonerId)
        load_dotenv()
        apiKey = os.getenv('API_KEY')
        params = {
            "api_key": apiKey
        }
        response = requests.get(f"https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/{summonerId}", params=params)
        if response.status_code == 200:
            print("api value",os.getenv("API_KEY"))
            data = response.json()
            newDict = generate_data_lol(data)
            return JsonResponse(newDict, safe=False)
        else:
            print("api key",apiKey)
            return JsonResponse({"error": "Failed to fetch data"}, status=response.status_code)

        
@user_schema
@users_schema_POST
@users_schema_GET
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'usernames':
            return [AllowAny()]

        if self.action == "create":
            return[AllowAny()]
        return [IsAuthenticated()]
     
    @user_usernames
    @action(detail=True, methods=['GET'])
    def usernames(self, request, username=None):
        is_username_exists = User.objects.filter(username=username).exists()
        return Response(is_username_exists)
    
    @user_profile
    @action(detail=True, methods=['GET'])
    def profiles(self, request, pk=None):
        user = User.objects.filter(pk=pk).first()
        profile = user.profile
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    
    @user_notifications
    @action(detail=True, methods=['GET'])
    def notifications(self, request, pk=None):
        notification = Notification.objects.filter(user_id=pk).order_by('-timestamp')
        serializer = NotificationSerializer(notification, many=True)
        return Response(serializer.data)
    
    @user_likes
    @action(detail=True, methods=['GET'])
    def likes(self, request, pk=None):
        likes = User.objects.get(id=pk).likes.all()
        serializer = LikeSerializer(likes, many=True)
        return Response(serializer.data)
    

