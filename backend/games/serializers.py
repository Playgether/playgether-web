from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Game, Company, ProfileGameLol, Category

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)


        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name

        return token


class ProfileGameLolSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileGameLol
        fields = (
            '__all__'
        )

    def save(self, *args, **kwargs):
        self.tag = self.tag.upper()
        return super().save(*args, **kwargs)

class GameSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Game
        fields = (
            '__all__'
        )

    def get_game_icon(self, obj):
        request = self.context.get('request')
        if obj.icon:
            return request.build_absolute_uri(obj.icon)
        else:
            return None
    
    def get_game_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image)
        else:
            return None

class CompaniesSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Company
        fields = (
            '__all__'
        )

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = (
            '__all__'
        )