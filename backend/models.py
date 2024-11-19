"""This file contains the all models for the database."""
from django.db import models


class CareServiceField(models.Model):
    """General fields of care services, abbreviated with e.g. A or S."""

    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=128)     # Field name, e.g. 'Allgemeine Pflege'
    short = models.CharField(max_length=8)      # E.g. 'A'

    def __str__(self):
        return f"{self.name} ({self.short})"


class CareServiceCategory(models.Model):
    """Categories of care services like hygiene, nutrition or mobilisation."""

    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=200)  # Category name, e.g. 'Körperpflege'

    def __str__(self):
        return self.name


class CareServiceOption(models.Model):
    """Care questions across all fields, categories, severities and index according to the PPBV."""

    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=200) # Concatenation of all columns, e.g. 'A-koerperpflege-1-1'
    field_id = models.ForeignKey('CareServiceField', on_delete=models.CASCADE)
    category_id = models.ForeignKey('CareServiceCategory', on_delete=models.CASCADE)
    severity = models.IntegerField()        # Degree of needed help, increasing from 1 to 4
    list_index = models.IntegerField()      # Index of question within single field, category and severity
    description = models.TextField()        # Content of question

    def __str__(self):
        return f"{self.field.short}{self.severity}-{self.category}-{self.list_index}"


class DailyClassification(models.Model):
    """Daily classification of patients according to the PPBV."""

    id = models.IntegerField(primary_key=True)
    patient_id = models.ForeignKey('Patient', on_delete=models.CASCADE)
    classification_date = models.DateField()  
    care_service_name = models.CharField(max_length=200) # Name of CareServiceOption, e.g. 'A-koerperpflege-1-1'
    is_in_isolation = models.BooleanField()
    data_accepted = models.BooleanField()   # Did the caregiver accept previous data
    result_minutes = models.IntegerField()  # Care time calculated according to PPBV
    station_id = models.ForeignKey('Station', on_delete=models.CASCADE)
    room_name = models.CharField(max_length=100)
    bed_number = models.CharField(max_length=100)

    class Meta:
        unique_together = ('patient_id', 'classification_date') 

    def __str__(self):
        return f"{self.patient_id} ({self.classification_date})"


class IsCareServiceUsed(models.Model):
    """Care service options used for a patient's daily classification on a specific date.
    Any entry here means that the service is used"""

    classification_id = models.ForeignKey('DailyClassification', on_delete=models.CASCADE)
    care_service_option_id = models.ForeignKey('CareServiceOption', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('classification_id', 'care_service_option_id') # Combined primary key

    def __str__(self):
        return self.classification_id


class Station(models.Model):
    """Stations in the hospital."""

    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    is_intensive_care = models.BooleanField()
    is_child_care_unit = models.BooleanField()
    bed_count = models.IntegerField()
    max_patients_per_caregiver = models.FloatField()    # Allowed ratio of patients per caregiver

    def __str__(self):
        return self.name


class Patient(models.Model):
    """Patients in the database."""

    id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    weight = models.FloatField()
    height = models.FloatField()
    station_id = models.ForeignKey('Station', on_delete=models.CASCADE) # Current station
    admission_date = models.DateTimeField()         # Date and time patient arrived at hospital
    discharge_date = models.DateField()             # Date patient will be released from hospital
    deceased_date = models.DateField()              # Date patient passed away

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    
class PatientTransfers(models.Model):
    """Transfers of patients between stations."""

    id = models.IntegerField(primary_key=True)
    patient_id = models.ForeignKey('Patient', on_delete=models.CASCADE)
    transfer_date = models.DateTimeField()              
    station_id_old = models.CharField(max_length=100)   # Station patient came from
    station_id_new = models.CharField(max_length=100)   # Station patient went to
    transferred_to_external = models.BooleanField()     # True if patient was transferred to different hospital

    def __str__(self):
        return f"{self.patient_id} {self.station_old} {self.station_new}"


class StationOccupancy(models.Model):
    """Daily patient occupancies of stations."""

    id = models.IntegerField(primary_key=True)
    station_id = models.ForeignKey('Station', on_delete=models.CASCADE)
    date = models.DateField()
    patients_in_total = models.IntegerField()       # Total patients incoming; sum of patients_in entries today
    patients_in_external = models.IntegerField()    # Incoming patients from outside hospital; sum of patients with admission date == today
    patients_in_internal = models.IntegerField()    # Incoming patients from other stations; sum of patientTransfers today with station_id_new == station_id
    patients_out_total = models.IntegerField()      # Total patients outgoing; sum of patients_out entries today
    patients_out_leave = models.IntegerField()      # Patients leaving hospital; sum of patients with discharge date == today
    patients_out_external = models.IntegerField()   # Patients going to other hospitals; sum of patientTransfers today with transferred_to_external == True
    patients_out_internal = models.IntegerField()   # Patients going to other stations; sum of patientTransfers today with station_id_old == station_id
    patients_out_deceased = models.IntegerField()   # Patients who passed away; sum of patients with deceased date == today
    patients_total = models.IntegerField()          # Total patients at end of day; patients_in_total - patients_out_total

    class Meta:
        unique_together = ('station_id', 'date')

    def __str__(self):
        return f"{self.station_id} {self.date} {self.patients_total}"


class StationWorkloadDaily(models.Model):
    """Daily workload for caregivers in all stations."""

    id = models.IntegerField(primary_key=True)
    station_id = models.ForeignKey('Station', on_delete=models.CASCADE)
    date = models.DateField()
    shift = models.CharField(max_length=100)        # Day or night shift
    patients_total = models.IntegerField()          # Patients_total of station and date; currently same for day and night shift   
    caregivers_total = models.IntegerField()        # Imported via shift plan
    patients_per_caregiver = models.FloatField()    # patients_total / caregivers_total, compare with max_patients_per_caregiver
    minutes_total = models.IntegerField()           # Sum of result_minutes of station and date
    minutes_per_caregiver =models.FloatField()      # minutes_total / caregivers_total

    class Meta:
        unique_together = ('station_id', 'date', 'shift')

    def __str__(self):
        return f"{self.station_id} {self.date} {self.shift} {self.patients_per_caregiver}"
    
    
class StationWorkloadMonthly(models.Model):
    """Monthly workload for caregivers in all stations for export."""

    id = models.IntegerField(primary_key=True)
    station_id = models.ForeignKey('Station', on_delete=models.CASCADE)
    month = models.DateField()                          # Use first day to represent month
    shift = models.CharField(max_length=100)            # Day or night shift
    patients_avg = models.FloatField()                  # Average daily patients; currently same for day and night shift
    caregivers_avg = models.FloatField()                # Average daily caregivers
    patients_per_caregiver_avg = models.FloatField()    # Average daily patients per caregiver
    
    class Meta:
        unique_together = ('station_id', 'month', 'shift')

    def __str__(self):
        return f"{self.station_id} {self.month} {self.shift} {self.patients_per_caregiver_avg}"