from .serializers import GameSerializer, CompaniesSerializer, ProfileGameLolSerializer, CategorySerializer
from rest_framework import viewsets
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from .models import Game, Company, ProfileGameLol, Category
from rest_framework.decorators import action
from django.views.generic import TemplateView
from myapp.serializers import ProfileSerializer
from .schema import (
    categories_schema, 
    categories_games_schema, 
    categories_schema_GET, 
    companies_schema, 
    companies_games_schema, 
    categories_schema_POST,
    companies_schema_GET,
    companies_schema_POST,
    profile_game_lol_schema,
    profile_game_lol_schema_GET,
    profile_game_lol_schema_POST,
    games_profiles_schema,
    game_schema,
    game_schema_POST,
    game_schema_GET,
)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class IndexView(TemplateView):
    template_name = 'index.html'

@categories_schema_POST
@categories_schema_GET
@categories_schema
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @categories_games_schema
    @action(detail=True, methods=['get'])
    def games(self, request, pk=None):
        category = Category.objects.get(id=pk)
        serializer = ProfileGameLolSerializer(category.games, many=True, context={'request': request})
        return Response(serializer.data)

@game_schema
@game_schema_GET
@game_schema_POST
class GamesViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all().order_by('id')
    serializer_class = GameSerializer
    @games_profiles_schema
    @action(detail=True, methods=['get'])
    def profiles(self, request, pk=None):
        game = Game.objects.get(id=pk)
        serializer = ProfileSerializer(game.profiles, many=True)
        return Response(serializer.data)
    
@companies_schema
@companies_schema_POST
@companies_schema_GET
class CompaniesViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompaniesSerializer
    
    @companies_games_schema
    @action(detail=True, methods=['get'])
    def games(self, request, pk=None):
        company = Company.objects.get(id=pk)
        serializer = GameSerializer(company.games, many=True, context={'request': request})
        return Response(serializer.data)


@profile_game_lol_schema
@profile_game_lol_schema_POST
@profile_game_lol_schema_GET
class ProfileGameLolViewSet(viewsets.ModelViewSet):
    queryset = ProfileGameLol.objects.all()
    serializer_class = ProfileGameLolSerializer

