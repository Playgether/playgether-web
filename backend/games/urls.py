from django.urls import path
from . import views
from rest_framework.routers import SimpleRouter
from .views import GamesViewSet, CompaniesViewSet, CategoryViewSet, ProfileGameLolViewSet, fetch_lol_entries

router = SimpleRouter()
router.register('games', GamesViewSet)
router.register('companies', CompaniesViewSet)
router.register('categories', CategoryViewSet)
# router.register('games/infos/lol', ProfileGameLolViewSet)





urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('api/v1/games/infos/lol/', fetch_lol_entries, name='lol_entries'),
]