"""This file is used to register the models in the admin panel of the Django application."""
from django.contrib import admin
from django.urls.resolvers import URLPattern

from .models import (
    CareServiceCategory, CareServiceField, CareServiceOption, IsCareServiceUsed, DailyClassification,
    Patient, Station, PatientTransfers, StationOccupancy, StationWorkloadDaily, StationWorkloadMonthly
)

# Register models without customization
admin.site.register(CareServiceCategory)
admin.site.register(CareServiceField)
admin.site.register(CareServiceOption)
admin.site.register(IsCareServiceUsed)
admin.site.register(DailyClassification)
admin.site.register(Patient)
admin.site.register(Station)
admin.site.register(StationOccupancy)
admin.site.register(StationWorkloadDaily)
admin.site.register(StationWorkloadMonthly)

@admin.register(PatientTransfers)
class PatientTransfersAdmin(admin.ModelAdmin):
    list_display = ('patient', 'admission_date', 'discharge_date', 'station_old', 'station_new', 'transferred_to_external')

    def get_readonly_fields(self, request, obj=None):
        """
        TODO: make station_old readable if the patient is new (still dk how to implement it)
        """
        readonly_fields = super(PatientTransfersAdmin, self).get_readonly_fields(request, obj) or ()

        if obj is not None: 
            if obj.station_old is None:  
                return readonly_fields + ('station_old',)
            return readonly_fields

        return readonly_fields

  
        
