from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from myapp.urls import router

urlpatterns = [
    path('admin/clearcache/', include('clearcache.urls')),
    path('api/v1/', include(router.urls)),
    path('admin/', admin.site.urls),
    path('', include('myapp.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
