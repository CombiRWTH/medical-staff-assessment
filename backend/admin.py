"""This file is used to register the models in the admin panel of the Django application."""
from django.contrib import admin

from .models import CareServiceClassification, CareServices, DailyClassification, Patient, Station

admin.site.register(CareServiceClassification)
admin.site.register(CareServices)
admin.site.register(DailyClassification)
admin.site.register(Patient)
admin.site.register(Station)
