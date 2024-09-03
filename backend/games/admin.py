from django.contrib import admin
from .models import Game, Category, Company, ProfileGameLol

# Register your models here.

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    display = ('name', 'acronym', 'category', 'company')

@admin.register(Category)
class CategoryAdmim(admin.ModelAdmin):
    model = Category
    display = ('name', 'description')

@admin.register(Company)
class CompanyAdmim(admin.ModelAdmin):
    model = Company
    display = ('name', 'description')

@admin.register(ProfileGameLol)
class ProfileGameAdmin(admin.ModelAdmin):
    model = ProfileGameLol
    display = ('username', 'tag', 'id_profile', 'puuid', 'summoner_id', 'rank')