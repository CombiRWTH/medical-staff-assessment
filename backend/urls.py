"""This file contains the URL patterns for the API."""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_home, name='api_home'),
]
