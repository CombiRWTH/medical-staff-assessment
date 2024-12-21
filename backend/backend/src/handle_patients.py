"""Provide an endpoint to retrieve all current patients for a station."""
import datetime
from datetime import time

from django.db.models import F, Max, OuterRef, Q, QuerySet, Subquery, Value
from django.db.models.functions import Concat
from django.http import JsonResponse
from django.utils import timezone

from ..models import DailyClassification, Patient, PatientTransfers


def get_active_patients_on_station(
    station_id: int, datetime: datetime.datetime = timezone.now()
) -> QuerySet[Patient]:
    """Get all patients assigned to a specific station on the given date.

    Args:
        station_id (int): The ID of the station in the database.
        datetime (datetime.datetime, optional): The datetime for which to retrieve the patients, defaults to now's time.

    Returns:
        list: The patients assigned to the station.
    """

    # Get the latest transfer_date for each patient
    latest_transfers = (
        PatientTransfers.objects.filter(transfer_date__lte=datetime)
        .values("patient")
        .annotate(latest_transfer_date=Max("transfer_date"))
    )

    # Filter the PatientTransfers based on the latest transfer_date and other conditions
    active_patients = PatientTransfers.objects.filter(
        Q(transfer_date__in=[lt["latest_transfer_date"] for lt in latest_transfers]),
        station_new_id=station_id,
        transferred_to_external=False,
        discharge_date__gte=datetime,
    )

    return active_patients


def get_patients_with_additional_information(station_id: int) -> list:
    """Get all patients assigned to a station with the date of their last classification and the bed they are
    assigned to.

    Args:
        station_id (int): The ID of the station.

    Returns:
        list: The patients assigned to the station.
    """
    now = timezone.now()

    # Get all patients assigned to the given station
    patients = get_active_patients_on_station(station_id)

    # Add the date the patient was last classified on that station
    patients = patients.annotate(
        lastClassification=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef("patient_id"), date__lte=now, station=station_id
            )
            .order_by("-date")
            .values("date")[:1]
        ),
        currentBed=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef("patient_id"), date__lte=now, station=station_id
            )
            .order_by("-date")
            .values("bed_number")[:1]
        ),
    ).values(
        "id",
        "lastClassification",
        "currentBed",
        name=Concat(F("patient__first_name"), Value(" "), F("patient__last_name")),
    )

    return list(patients)


def get_current_station_for_patient(patient_id: int) -> str:
    """Get the current station for a patient.

    Args:
        patient_id (int): The ID of the patient.

    Returns:
        int: The ID of the station the patient is currently assigned to.
    """

    now = timezone.now()

    # Get the latest transfer_date for the patient
    latest_transfer = PatientTransfers.objects.filter(
        patient_id=patient_id, transfer_date__lte=now
    ).latest("transfer_date")

    if latest_transfer.transferred_to_external:
        return "external"
    else:
        return int(latest_transfer.station_new_id)


def get_patient_count_per_station(station_id: int) -> int:
    """Get the number of patients currently assigned to a station. Needed for night shift calculation.

    Args:
        station_id (int): The ID of the station.

    Returns:
        int: The number of patients assigned to the station.
    """

    return get_active_patients_on_station(station_id).count()


def is_patient_new_to_station(patient_id: int, station_id: int) -> bool:
    """Check if a patient was at station in the last three months.
    If yes, the 75 minutes are not added in care calculation.

    Args:
        patient_id (int): The ID of the patient.
        station_id (int): The ID of the station.

    Returns:
        bool: True if the patient is new to the station, False otherwise.
    """
    now = timezone.now()

    # Get the latest transfer_date for the patient
    latest_transfer_to_station = PatientTransfers.objects.filter(
        patient_id=patient_id, station_new_id=station_id, transfer_date__lte=now
    ).latest("transfer_date")

    if (now - latest_transfer_to_station.transfer_date).days > 90:
        return True
    else:
        return False


def visited_at_nighttime(
    transfer_datetime: datetime.datetime,
    now: datetime = timezone.now(),
) -> bool:
    """Check if the patient's stay includes time in night shift."""
    if timezone.is_naive(transfer_datetime):
        transfer_datetime = timezone.make_aware(
            transfer_datetime, timezone.get_current_timezone()
        )

    # Define night shift start and end times
    night_start = timezone.make_aware(
        datetime.datetime.combine(now.date() - datetime.timedelta(days=1), time(22, 0)),
        timezone.get_current_timezone(),
    )  # 10 PM yesterday
    night_end = timezone.make_aware(
        datetime.datetime.combine(now.date(), time(6, 0)),
        timezone.get_current_timezone(),
    )  # 6 AM today

    if transfer_datetime.date() == now.date():
        if night_start <= transfer_datetime <= night_end:
            return True  # Patient was transferred during night
    else:
        return True  # Patient was transferred before today and stayed overnight
    return False


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
    now = timezone.now()

    all_patients = get_active_patients_on_station(station_id)
    for patient_transfer in all_patients:
        transfer_datetime = patient_transfer.transfer_date
        includes_night_time = visited_at_nighttime(transfer_datetime, now)
        patient_name = f"{patient_transfer.patient.first_name} {patient_transfer.patient.last_name}"
        stay_duration = now - transfer_datetime

        if stay_duration <= datetime.timedelta(hours=6):
            acute.append(patient_name)
        elif datetime.timedelta(hours=6) < stay_duration < datetime.timedelta(
            hours=24
        ) or (includes_night_time and stay_duration < datetime.timedelta(hours=24)):
            part_stationary.append(patient_name)
        elif stay_duration >= datetime.timedelta(hours=24):
            stationary.append(patient_name)
        else:
            undefined.append(patient_name)

    return {
        'stationary': stationary,
        'part_stationary': part_stationary,
        'acute': acute,
        'undefined': undefined
    }


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
