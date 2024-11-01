"""This file contains the all models for the database."""
from django.db import models


class CareServices(models.Model):
    """Questions and their belonging Service Classifications according to the PPBV."""

    care_service_name = models.CharField(max_length=200, primary_key=True)
    care_service_category = models.CharField(max_length=1)  # For example A for 'Allgemeine Pflege'
    care_service_task = models.CharField(max_length=1)  # For example 'Körperpflege'
    care_service_range = models.IntegerField()  # 1-4
    care_service_option = models.IntegerField()  # Index of the questions
    care_service_description = models.TextField()  # Content of the question


class DailyClassification(models.Model):
    """Daily Classification of the care services for a person."""

    patient_id = models.ForeignKey('Patient', on_delete=models.CASCADE)
    classification_date = models.DateField()
    is_in_isolation = models.BooleanField()
    data_accepted = models.BooleanField()  # Did the caregiver accept previous data
    result_minutes = models.IntegerField()  # Time in minutes calculated according to the PPBV
    station = models.ForeignKey('Station', on_delete=models.CASCADE)
    room_name = models.CharField(max_length=100)
    bed_number = models.CharField(max_length=100)


class CareServiceClassification(models.Model):
    """Care Service Classification for a person on a specific date."""

    care_service_name = models.ForeignKey('CareServices', on_delete=models.CASCADE)
    classification = models.ForeignKey('DailyClassification', on_delete=models.CASCADE)


class Station(models.Model):
    """Stations in the hospital."""

    station_name = models.CharField(max_length=100)
    is_intensive_care = models.BooleanField()
    is_child_care_unit = models.BooleanField()
    patients_per_caregiver_ratio = models.FloatField()


class Patient(models.Model):
    """Patients in the database."""

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    patient_id = models.CharField(max_length=20)  # The patients ID provided by the hospital
