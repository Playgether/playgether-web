from django.db import models
from stdimage import StdImageField
from .functions import get_file_game_path, get_file_company_path
from myapp.models import Profile

class Category(models.Model):
    name = models.CharField("Name", max_length=30)
    description = models.TextField("Description", max_length=3000)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Company(models.Model):
    name = models.CharField("Name", max_length=30)
    description = models.TextField("Description", max_length=3000)
    foundation_date = models.DateField(null=True, blank=True)
    location = models.CharField("Location", max_length=100)
    foundation_date_text = models.CharField("Foundation Date (written out in full)", max_length=100, null=True, blank=True)
    logo = StdImageField(upload_to=get_file_company_path)

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
    
    def __str__(self):
        return self.name   

class Game(models.Model):
    name = models.CharField("Name", max_length=100)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True, related_name="games")
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, blank=True, null=True, related_name="games")
    release_date = models.DateField(null=True, blank=True)
    release_date_text = models.CharField("Release Date (written out in full)", max_length=100, null=True, blank=True)
    icon = StdImageField(upload_to=get_file_game_path)
    image = StdImageField(upload_to=get_file_game_path)
    description = models.TextField("Description", max_length=3000)
    acronym = models.CharField("Acronym", max_length=8)

    class Meta:
        verbose_name = "Game"
        verbose_name_plural = "Games"

    def __str__(self):
        return f"Game name: {self.name}, Category: {self.category.name}"

class ProfileGame(models.Model):
    id_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="games")
    id_game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="profiles")
    identification = models.CharField("Identification", max_length=30) #nick+tag
    rank = models.CharField("Rank", max_length=15)

    class Meta:
        verbose_name = "ProfileGame"
        verbose_name_plural= "ProfilesGames"

    def __str__(self):
        return f"Profile: {self.id_profile.user.first_name} | Game: {self.id_game.name}"

# class ExtraProfileGameLol(models.Model):
#     id_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="extra_lol")
#     account_id = models.CharField("Account_id", max_length=50)
#     puuid = models.CharField("Puuid", max_length=80)
#     summoner_id = models.CharField("Puuid", max_length=50)    



#Associar game e company a um perfil

# Puuid / Summoner_id (ID) / Account_ID  

# game riot = rank


