from django.urls import path
from  . import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('profile_list/', views.ProfileListView.as_view(), name='profile_list')
]