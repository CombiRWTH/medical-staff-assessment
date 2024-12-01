"""Provide an endpoint to retrieve all current patients for a station."""
import datetime

from django.db.models.functions import Concat
from django.http import JsonResponse
from ..models import Patient, DailyClassification
from django.db.models import Subquery, OuterRef, F, Value, QuerySet


def get_active_patients_on_station(station_id: int, date: datetime.date = datetime.date.today()) -> QuerySet[Patient]:
    """Get all patients assigned to a specific station on the given date.

    Args:
        station_id (int): The ID of the station in the database.
        date (datetime.date, optional): The date for which to retrieve the patients, defaults to today's date.

    Returns:
        list: The patients assigned to the station.
    """
    patients = Patient.objects.all()

    return patients


def get_patients_with_additional_information(station_id: int) -> list:
    """Get all patients assigned to a station with the date of their last classification and the bed they are assigned to.

    Args:
        station_id (int): The ID of the station.

    Returns:
        list: The patients assigned to the station.
    """
    today = datetime.date.today()

    # Get all patients assigned to the given station
    patients = get_active_patients_on_station(station_id)

    # Add the date the patient was last classified on that station
    patients = patients.annotate(
        lastClassification=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef('id'),
                date__lte=today,
                station=station_id
            )
            .order_by('-date')
            .values('date')[:1]
        ),
        currentBed=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef('id'),
                date__lte=today,
                station=station_id
            ).values("bed_number")
        )
    ).values('id', 'lastClassification', "currentBed", name=Concat(F('first_name'), Value(' '), F('last_name')))

    return list(patients)


def handle_patients(request, station_id: int) -> JsonResponse:
    """Endpoint to retrieve all current patients for a station.

    Args:
        request (HttpRequest): The request object.
        station_id (int): The ID of the station in the database.

    Returns:
        JsonResponse: The response containing the calculated minutes.
    """
    if request.method == 'GET':
        return JsonResponse(get_patients_with_additional_information(station_id), safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
