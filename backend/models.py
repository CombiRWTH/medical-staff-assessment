"""This file contains the all models for the database."""
from django.db import models


class CareServiceField(models.Model):
    """General fields of care services, abbreviated with e.g. A or S."""

    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=128)  # Field name, e.g. 'Allgemeine Pflege'
    short = models.CharField(max_length=8)  # E.g. 'A'

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
    name = models.CharField(max_length=200)  # Concatenation of all columns, e.g. 'A-koerperpflege-1-1'
    field = models.ForeignKey('CareServiceField', on_delete=models.CASCADE)
    category = models.ForeignKey('CareServiceCategory', on_delete=models.CASCADE)
    severity = models.IntegerField()  # Degree of needed help, increasing from 1 to 4
    list_index = models.IntegerField()  # Index of question within single field, category and severity
    description = models.TextField()  # Content of question

    def __str__(self):
        return f"{self.field.short}{self.severity}-{self.category}-{self.list_index}"


class DailyClassification(models.Model):
    """Daily classification of patients according to the PPBV."""

    patient = models.ForeignKey('Patient', on_delete=models.CASCADE)
    date = models.DateField()
    is_in_isolation = models.BooleanField()
    data_accepted = models.BooleanField()  # Did the caregiver accept previous data
    result_minutes = models.IntegerField()  # Care time calculated according to PPBV
    a_index = models.IntegerField()  # Index of care group A
    s_index = models.IntegerField()  # Index of care group S
    station = models.ForeignKey('Station', on_delete=models.CASCADE)
    room_name = models.CharField(max_length=100)
    bed_number = models.CharField(max_length=100)

    class Meta:
        unique_together = ('patient', 'date')

    def __str__(self):
        return f"{self.patient} ({self.date})"


class IsCareServiceUsed(models.Model):
    """Care service options used for a patient's daily classification on a specific date.
    Any entry here means that the service is used"""

    classification = models.ForeignKey('DailyClassification', on_delete=models.CASCADE)
    care_service_option = models.ForeignKey('CareServiceOption', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('classification', 'care_service_option')  # Combined primary key

    def __str__(self):
        return f"{self.care_service_option} {self.classification}"


class Station(models.Model):
    """Stations in the hospital."""

    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    is_intensive_care = models.BooleanField()
    is_child_care_unit = models.BooleanField()
    bed_count = models.IntegerField()
    max_patients_per_caregiver = models.FloatField()  # Allowed ratio of patients per caregiver

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
    deceased_date = models.DateField()  # Date patient passed away

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class PatientTransfers(models.Model):
    """Transfers of patients between stations."""

    id = models.IntegerField(primary_key=True)
    patient = models.ForeignKey('Patient', on_delete=models.CASCADE)
    transfer_date = models.DateTimeField()
    admission_date = models.DateTimeField()  # Date and time patient arrived at hospital
    discharge_date = models.DateField()  # Date patient will be released from hospital
    station_old = models.CharField(max_length=100)  # Station patient came from
    station_new = models.CharField(max_length=100)  # Station patient went to
    transferred_to_external = models.BooleanField()  # True if patient was transferred to different hospital

    def __str__(self):
        return f"{self.patient} {self.station_old} {self.station_new}"


class StationOccupancy(models.Model):
    """Daily patient occupancies of stations."""

    id = models.IntegerField(primary_key=True)
    station = models.ForeignKey('Station', on_delete=models.CASCADE)
    date = models.DateField()
    patients_in_total = models.IntegerField()  # total patients incoming today
    patients_in_external = models.IntegerField()  # patients with admission_date == today
    patients_in_internal = models.IntegerField()  # patientTransfers today with station_id_new == station_id
    patients_out_total = models.IntegerField()  # total patients outgoing today
    patients_out_leave = models.IntegerField()  # patients with discharge_date == today
    patients_out_external = models.IntegerField()  # patientTransfers today with transferred_to_external == True
    patients_out_internal = models.IntegerField()  # patientTransfers today with station_id_old == station_id
    patients_out_deceased = models.IntegerField()  # patients with deceased_date == today
    patients_total = models.IntegerField()  # patients_in_total - patients_out_total

    class Meta:
        unique_together = ('station', 'date')

    def __str__(self):
        return f"{self.station} {self.date} {self.patients_total}"


class StationWorkloadDaily(models.Model):
    """Daily workload for caregivers in all stations."""

    id = models.IntegerField(primary_key=True)
    station = models.ForeignKey('Station', on_delete=models.CASCADE)
    date = models.DateField()
    shift = models.CharField(max_length=100)  # Day or night shift
    patients_total = models.IntegerField()  # Patients_total of station and date
    caregivers_total = models.IntegerField()  # Imported via shift plan
    patients_per_caregiver = models.FloatField()  # patients_total / caregivers_total
    minutes_total = models.IntegerField()  # Sum of result_minutes of station and date
    minutes_per_caregiver = models.FloatField()  # minutes_total / caregivers_total

    class Meta:
        unique_together = ('station', 'date', 'shift')

    def __str__(self):
        return f"{self.station} {self.date} {self.shift} {self.patients_per_caregiver}"


class StationWorkloadMonthly(models.Model):
    """Monthly workload for caregivers in all stations for export."""

    id = models.IntegerField(primary_key=True)
    station = models.ForeignKey('Station', on_delete=models.CASCADE)
    month = models.DateField()  # Use first day to represent month
    shift = models.CharField(max_length=100)  # Day or night shift
    patients_avg = models.FloatField()  # Average daily patients; currently same for day and night
    caregivers_avg = models.FloatField()  # Average daily caregivers
    patients_per_caregiver_avg = models.FloatField()  # Average daily patients per caregiver

    class Meta:
        unique_together = ('station', 'month', 'shift')

    def __str__(self):
        return f"{self.station} {self.month} {self.shift} {self.patients_per_caregiver_avg}"
