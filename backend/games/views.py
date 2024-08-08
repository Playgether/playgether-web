from .serializers import GameSerializer, CompaniesSerializer
from rest_framework import viewsets
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from .models import Game, Company
from rest_framework.decorators import action
from django.views.generic import TemplateView


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class IndexView(TemplateView):
    template_name = 'index.html'

class GamesViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

class CompaniesViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompaniesSerializer

    @action(detail=True, methods=['get'])
    def games(self, request, pk=None):
        games = Game.objects.filter(company=pk)
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)