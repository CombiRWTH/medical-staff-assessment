"""Provide an endpoint to retrieve all current patients for a station."""
import datetime
from django.http import JsonResponse
from ..models import Patient, DailyClassification
from django.db.models import QuerySet


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
    """Get all patients assigned to a station.

    Additional information is added to each patient:
    - The patient's full name
    - The bed number the patient is currently in
    - The relevant classification information of the patient for today
    - The relevant classification information of the patient for the previous day

    Args:
        station_id (int): The ID of the station.

    Returns:
        list: The patients assigned to the station.
    """
    today = datetime.date.today()

    # Get all patients assigned to the given station
    patients = list(get_active_patients_on_station(station_id).values())

    for patient in patients:
        # Get todays classification
        todays_classification = DailyClassification.objects.filter(
            patient=patient['id'],
            date=today,
            station=station_id
        ).values().first()

        # Get the previous classification
        previous_classification = DailyClassification.objects.filter(
            patient=patient['id'],
            date__lt=today,
            station=station_id
        ).order_by('-date').values().first()

        # Add the classifications to the patient
        patient['lastClassification'] = (
            todays_classification['date'] if todays_classification
            else previous_classification['date'] if previous_classification
            else None
        )
        patient['aIndexToday'] = todays_classification['a_index'] if todays_classification else None
        patient['aIndexPrevious'] = previous_classification['a_index'] if previous_classification else None
        patient['sIndexToday'] = todays_classification['s_index'] if todays_classification else None
        patient['sIndexPrevious'] = previous_classification['s_index'] if previous_classification else None
        patient['todaysMinutes'] = todays_classification['result_minutes'] if todays_classification else 0

        # Add the full name to the patient
        patient['name'] = f"{patient['first_name']} {patient['last_name']}"

        # Add the current bed number to the patient (either from today's classification or the previous one)
        patient['currentBed'] = (
            todays_classification['bed_number'] if todays_classification
            else previous_classification['bed_number'] if previous_classification
            else None
        )

    return patients


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
