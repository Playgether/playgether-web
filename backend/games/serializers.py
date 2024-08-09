from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Game, Company, ProfileGame

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)


        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name

        return token

class GameSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Game
        fields = (
            '__all__'
        )

class CompaniesSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Company
        fields = (
            '__all__'
        )

class ProfileGameSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfileGame
        fields = (
            '__all__'
        )