from django.urls import path
from  . import views
from rest_framework.routers import SimpleRouter
from .views import UserViewSet, ProfileViewSet, PostsViewSet

router = SimpleRouter()
router.register('users', UserViewSet)
router.register('profiles', ProfileViewSet)
router.register('posts', PostsViewSet)


urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
]