from django.urls import path
from . import views
from rest_framework.routers import SimpleRouter
from .views import GamesViewSet, CompaniesViewSet

router = SimpleRouter()
router.register('games', GamesViewSet)
router.register('companies', CompaniesViewSet)



urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
]