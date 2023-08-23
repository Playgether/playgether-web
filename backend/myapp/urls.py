from django.urls import path
from  . import views
from rest_framework.routers import SimpleRouter
from .views import UserViewSet, ProfileViewSet

router = SimpleRouter()
router.register('users', UserViewSet)
router.register('profiles', ProfileViewSet)


urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
]