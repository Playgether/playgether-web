from .serializers import GameSerializer, CompaniesSerializer, ProfileGameLolSerializer, CategorySerializer
from rest_framework import viewsets
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from .models import Game, Company, ProfileGameLol, Category
from rest_framework.decorators import action
from django.views.generic import TemplateView
from myapp.serializers import ProfileSerializer
from dotenv import load_dotenv
import os
import requests
from django.http import JsonResponse, HttpRequest
from .schema import (
    categories_schema, 
    categories_games_schema, 
    categories_schema_GET, 
    companies_schema, 
    companies_games_schema, 
    categories_schema_POST,
    companies_schema_GET,
    companies_schema_POST,
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

class GamesViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all().order_by('id')
    serializer_class = GameSerializer

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
    
class ProfileGameLolViewSet(viewsets.ModelViewSet):
    queryset = ProfileGameLol.objects.all()
    serializer_class = ProfileGameLolSerializer


def fetch_lol_entries(request):
    load_dotenv()
    apiKey = os.getenv('API_KEY')
    params = {
        "api_key": apiKey
    }
    response = requests.get("https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/OYwuhkmvYXv3LYqwHYjMUToYBczTTxwCXNKHTaXpej_Mxw", params=params)
    if response.status_code == 200:
        print("api value",os.getenv("API_KEY"))
        data = response.json()
        winRate0 = (data[0]["wins"] / (data[0]["wins"] + data[0]["losses"])) * 100
        winRate1 = (data[1]["wins"] / (data[1]["wins"] + data[1]["losses"])) * 100
        newDict = [
            {
                "queueType": data[0]["queueType"],
                "tier": data[0]["tier"],
                "rank": data[0]["rank"],
                "leaguePoints": data[0]["leaguePoints"],
                "wins": data[0]["wins"],
                "losses": data[0]["losses"],
                "winRate": str(int(round(winRate0, 0))) + "%",
            },
            {
                "queueType": data[1]["queueType"],
                "tier": data[1]["tier"],
                "rank": data[1]["rank"],
                "leaguePoints": data[1]["leaguePoints"],
                "wins": data[1]["wins"],
                "losses": data[1]["losses"],
                "winRate": str(int(round(winRate1, 0))) + "%",
            }
        ]
        return JsonResponse(newDict, safe=False)
    else:
        print("api key",apiKey)
        return JsonResponse({"error": "Failed to fetch data"}, status=500)