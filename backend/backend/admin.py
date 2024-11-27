"""This file is used to register the models in the admin panel of the Django application."""
from django.contrib import admin

from .models import CareServiceCategory, CareServiceField, CareServiceOption, IsCareServiceUsed, DailyClassification, \
    Patient, Station, PatientTransfers, StationOccupancy, StationWorkloadDaily, StationWorkloadMonthly

admin.site.register(CareServiceCategory)
admin.site.register(CareServiceField)
admin.site.register(CareServiceOption)
admin.site.register(IsCareServiceUsed)
admin.site.register(DailyClassification)
admin.site.register(Patient)
admin.site.register(Station)
admin.site.register(PatientTransfers)
admin.site.register(StationOccupancy)
admin.site.register(StationWorkloadDaily)
admin.site.register(StationWorkloadMonthly)
