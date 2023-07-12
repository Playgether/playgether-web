from django.urls import path
from  . import views
from rest_framework.routers import SimpleRouter
from .views import UserViewSet

router = SimpleRouter()
router.register('users', UserViewSet)


urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('profile_list/', views.ProfileListView.as_view(), name='profile_list')
]