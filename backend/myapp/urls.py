from django.urls import path
from  . import views
from rest_framework.routers import SimpleRouter
from .views import UserViewSet, ProfileViewSet, PostsViewSet, CommentViewSet

router = SimpleRouter()
router.register('users', UserViewSet)
router.register('profiles', ProfileViewSet)
router.register('posts', PostsViewSet)
router.register('comments', CommentViewSet)


urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
]