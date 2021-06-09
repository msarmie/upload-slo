from django.conf.urls import include, url

import uploadslo.api.uploadslo_rest_api
from uploadslo.content.uploadslo import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    # url(r'^', include(uploadslo.content.uploadslo.urls)),
]