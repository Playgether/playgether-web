from .serializers import GameSerializer, CompaniesSerializer, ProfileGameSerializer, CategorySerializer
from rest_framework import viewsets
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from .models import Game, Company, ProfileGame, Category
from rest_framework.decorators import action
from django.views.generic import TemplateView
from myapp.serializers import ProfileSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class IndexView(TemplateView):
    template_name = 'index.html'

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @action(detail=True, methods=['get'])
    def games(self, request, pk=None):
        category = Category.objects.get(id=pk)
        serializer = GameSerializer(category.games, many=True, context={'request': request})
        return Response(serializer.data)

class GamesViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all().order_by('id')
    serializer_class = GameSerializer

    @action(detail=True, methods=['get'])
    def profiles(self, request, pk=None):
        game = Game.objects.get(id=pk)
        serializer = ProfileSerializer(game.profiles, many=True)
        return Response(serializer.data)

class CompaniesViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompaniesSerializer

    @action(detail=True, methods=['get'])
    def games(self, request, pk=None):
        company = Company.objects.get(id=pk)
        serializer = GameSerializer(company.games, many=True, context={'request': request})
        return Response(serializer.data)
    
class ProfileGameViewSet(viewsets.ModelViewSet):
    queryset = ProfileGame
    serializer_class = ProfileGameSerializer