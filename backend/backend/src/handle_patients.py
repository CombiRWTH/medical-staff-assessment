"""Provide an endpoint to retrieve all current patients for a station."""
from datetime import date, timedelta

from django.db.models import F, OuterRef, QuerySet, Subquery, Value
from django.db.models.functions import Concat
from django.http import JsonResponse
from django.utils import timezone

from ..models import DailyClassification, DailyPatientData, Patient


def get_active_patients_on_station(station_id: int, date: date = date.today()) -> QuerySet[Patient]:
    """Get all patients assigned to a specific station on the given date.

    Args:
        station_id (int): The ID of the station in the database.
        date (date, optional): The date for which to retrieve the patients, defaults to today's date.

    Returns:
        list: The patients assigned to the station.
    """
    patients = DailyPatientData.objects.filter(
        station=station_id,
        date=date
    ).values('patient')

    patients = Patient.objects.filter(id__in=patients)

    return patients


def get_patients_with_additional_information(station_id: int) -> list:
    """Get all patients assigned to a station.

    Additional information is added to each patient:
    - The patient's full name
    - The bed number the patient is currently in
    - The room name the patient is currently in
    - The relevant classification information of the patient for today
    - The relevant classification information of the patient for the previous day

    Args:
        station_id (int): The ID of the station.

    Returns:
        list: The patients assigned to the station.
    """
    today = timezone.now().date()

    # Get all patients assigned to the given station
    patients = get_active_patients_on_station(station_id)

    # Add the date the patient was last classified on that station
    patients = patients.annotate(
        lastClassification=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef("id"), date__lte=today, station=station_id
            )
            .order_by("-date")
            .values("date")[:1]
        ),
        currentRoom=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef("id"), date__lte=today, station=station_id
            )
            .order_by("-date")
            .values("room_name")[:1]
        ),
        currentBed=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef("id"), date__lte=today, station=station_id
            )
            .order_by("-date")
            .values("bed_number")[:1]
        ),
    ).values(
        "id",
        "lastClassification",
        "currentRoom",
        "currentBed",
        name=Concat(F("first_name"), Value(" "), F("last_name")),
    )

    return list(patients)


def get_current_station_for_patient(patient_id: int) -> str:
    """Get the current station for a patient.

    Args:
        patient_id (int): The ID of the patient.

    Returns:
        int: The ID of the station the patient is currently assigned to.
    """
    today = timezone.now().date()
    station = DailyPatientData.objects.filter(
        patient=patient_id,
        date__lte=today
    ).order_by('-date').values('station')[:1]

    return station[0]['station'] if station else None


def get_patient_count_per_station(station_id: int) -> int:
    """Get the number of patients currently assigned to a station. Needed for night shift calculation.

    Args:
        station_id (int): The ID of the station.

    Returns:
        int: The number of patients assigned to the station.
    """
    return get_active_patients_on_station(station_id).count()


def get_patients_visit_type(station_id: int) -> dict:
    """Return lists of patients for a single station classified by visit type.

    Args:
        station_id (int): The ID of the station.

    Returns:
        dict: A dictionary with lists of patients classified by visit type.
    """
    all_patients = get_active_patients_on_station(station_id)
    stationary = (
        []
    )  # normally >= 1 day shift and >= 1 night shift, but here > 24 hours for simplicity
    part_stationary = []  # (6 <= hours < 24) OR (overnight stay AND < 24 hours)
    acute = []  # < 6 hours, only day shift
    undefined = []  # catch possible edges cases

    for patient in all_patients:
        # Get the daily patient data for the patient
        daily_data = DailyPatientData.objects.filter(
            patient=patient, date=timezone.now().date()
        ).first()

        includes_night_time = daily_data.night_stay
        patient_name = f"{patient.first_name} {patient.last_name}"
        stay_duration = daily_data.day_of_discharge - daily_data.day_of_admission

        if stay_duration <= timedelta(hours=6):
            acute.append(patient_name)
        elif (timedelta(hours=6) < stay_duration < timedelta(hours=24)
              or (includes_night_time and stay_duration < timedelta(hours=24))):
            part_stationary.append(patient_name)
        elif stay_duration >= timedelta(hours=24):
            stationary.append(patient_name)
        else:
            undefined.append(patient_name)

    return {
        'stationary': stationary,
        'part_stationary': part_stationary,
        'acute': acute,
        'undefined': undefined
    }


def get_dates_for_patient_classification(patient_id: int, station_id: int) -> list:
    """Get the dates a patient needs a classification.

    Args:
        patient_id (int): The ID of the patient.
        station_id (int): The ID of the station.

    Returns:
        list: The dates the patient needs a classification.
    """
    dates = DailyPatientData.objects.filter(
        patient=patient_id,
        station=station_id,
    ).values('date')

    return list(dates)


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


def handle_visit_type(request, station_id: int) -> JsonResponse:
    """Endpoint to retrieve lists of patients for a single station classified by visit type.

    Args:
        request (HttpRequest): The request object.
        station_id (int): The ID of the station in the database.

    Returns:
        JsonResponse: The response containing the patients at station categorized by visit type.
    """
    if request.method == 'GET':
        return JsonResponse(get_patients_visit_type(station_id), safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


def handle_current_station_of_patient(request, patient_id: int) -> JsonResponse:
    """Endpoint to retrieve the current station of a patient.

    Args:
        request (HttpRequest): The request object.
        patient_id (int): The ID of the patient in the database.

    Returns:
        JsonResponse: The response containing the current station of the patient.
    """
    if request.method == 'GET':
        return JsonResponse({'station_id': get_current_station_for_patient(patient_id)})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


def handle_patient_dates(request, patient_id: int, station_id: int) -> JsonResponse:
    """Endpoint to retrieve the dates a patient needs a classification.

    This includes dates with and without already made classifications.

    Args:
        request (HttpRequest): The request object.
        patient_id (int): The ID of the patient.
        station_id (int): The ID of the station.

    Returns:
        JsonResponse: The response containing the dates the patient needs a classification.
    """
    if request.method == 'GET':
        return JsonResponse({'dates': get_dates_for_patient_classification(patient_id, station_id)})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
