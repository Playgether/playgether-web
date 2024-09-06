from .serializers import GameSerializer, CompaniesSerializer, ProfileGameLolSerializer, CategorySerializer
from rest_framework import viewsets
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from .models import Game, Company, ProfileGameLol, Category
from rest_framework.decorators import action
from django.views.generic import TemplateView
from myapp.serializers import ProfileSerializer

import requests
from django.http import JsonResponse, HttpRequest

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
    
class ProfileGameLolViewSet(viewsets.ModelViewSet):
    queryset = ProfileGameLol.objects.all()
    serializer_class = ProfileGameLolSerializer


def fetch_lol_entries(request):
    params = {
        "api_key": "RGAPI-1000e917-7c4f-4b60-a6dc-a0756345bbca"
    }
    response = requests.get("https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/OYwuhkmvYXv3LYqwHYjMUToYBczTTxwCXNKHTaXpej_Mxw", params=params)
    if response.status_code == 200:
        data = response.json()
        winRate0 = (data[0]["wins"] / (data[0]["wins"] + data[0]["losses"])) * 100
        winRate1 = (data[0]["wins"] / (data[1]["wins"] + data[1]["losses"])) * 100
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
        return JsonResponse({"error": "Failed to fetch data"}, status=500)