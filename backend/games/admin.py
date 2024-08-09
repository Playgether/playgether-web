from django.contrib import admin
from .models import Game, Category, Company, ProfileGame

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

@admin.register(ProfileGame)
class ProfileGameAdmin(admin.ModelAdmin):
    model = ProfileGame
    display = ('id_profile', 'id_game', 'identification', 'rank', 'extra_identification')