from django.views.generic import TemplateView
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

  
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    

class IndexView(TemplateView):
    template_name = 'index.html'


class PostsViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    @action(detail=True, methods=['get', 'post'])
    def feed(self, request, pk=None):
        following = Profile.objects.get(user_id=pk).follows.exclude(user_id=pk)
        ids_seguindo = [user.id for user in following]
        posts = Post.objects.filter(created_by_user__in=ids_seguindo).order_by("-timestamp")
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'delete'])
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
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        comments = Comment.objects.filter(object_id=pk).order_by('-timestamp')
        comment_serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(comment_serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=False, methods=['get'])
    def profiles(self, request, user_id=None):
        profile = Profile.objects.filter(user_id=user_id).first()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def games(self, request, pk=None):
        profile = Profile.objects.get(user_id=pk)
        games = [pg.id_game for pg in profile.games.all()]  # Obtém os jogos em vez do relacionamento
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='games/infos/lol')
    def info_test(self, request, pk=None):
        info = ProfileGameLol.objects.filter(id_profile=pk).first()
        
        if info is None:
            return Response([], status=status.HTTP_200_OK)
        
        serializer = ProfileGameLolSerializer(info)
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

