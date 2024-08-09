from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from myapp.urls import router as myapp_router
from games.urls import router as games_router
from myapp.views import MyTokenObtainPairView
from games.views import MyTokenObtainPairView
from patches import routers

from rest_framework_simplejwt.views import (
    TokenRefreshView
)

router = routers.DefaultRouter()
router.extend(myapp_router)
router.extend(games_router)

urlpatterns = [
    path('admin/clearcache/', include('clearcache.urls')),
    path('api/v1/', include(router.urls)),
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),
    path('', include('games.urls')),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
