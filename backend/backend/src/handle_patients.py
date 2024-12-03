"""Provide an endpoint to retrieve all current patients for a station."""
import datetime
from datetime import time

from django.db.models import F, Max, OuterRef, Q, QuerySet, Subquery, Value
from django.db.models.functions import Concat
from django.http import JsonResponse

from ..models import DailyClassification, Patient, PatientTransfers


def get_active_patients_on_station(station_id: int, date: datetime.date = datetime.date.today()) -> QuerySet[Patient]:
    """Get all patients assigned to a specific station on the given date.

    Args:
        station_id (int): The ID of the station in the database.
        date (datetime.date, optional): The date for which to retrieve the patients, defaults to today's date.

    Returns:
        list: The patients assigned to the station.
    """

    # Get the latest transfer_date for each patient
    latest_transfers = PatientTransfers.objects.filter(
        transfer_date__lte=date
    ).values('patient').annotate(
        latest_transfer_date=Max('transfer_date')
    )

    # Filter the PatientTransfers based on the latest transfer_date and other conditions
    active_patients = PatientTransfers.objects.filter(
        Q(transfer_date__in=[lt['latest_transfer_date'] for lt in latest_transfers]),
        station_new_id=station_id,
        transferred_to_external=False,
        discharge_date__gte=date
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
    today = datetime.date.today()

    # Get all patients assigned to the given station
    patients = get_active_patients_on_station(station_id)

    # Add the date the patient was last classified on that station
    patients = patients.annotate(
        lastClassification=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef('patient_id'),
                date__lte=today,
                station=station_id
            )
            .order_by('-date')
            .values('date')[:1]
        ),
        currentBed=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef('patient_id'),
                date__lte=today,
                station=station_id
            ).values("bed_number")
        )
    ).values('id', 'lastClassification', "currentBed", name=Concat(F('patient__first_name'), Value(' '),
                                                                   F('patient__last_name')))

    return list(patients)


def get_current_station_for_patient(patient_id: int) -> int:
    """Get the current station for a patient.

    Args:
        patient_id (int): The ID of the patient.

    Returns:
        int: The ID of the station the patient is currently assigned to.
    """
    today = datetime.date.today()

    # Get the latest transfer_date for the patient
    latest_transfer = PatientTransfers.objects.filter(
        patient_id=patient_id,
        transfer_date__lte=today
    ).latest('transfer_date')

    return latest_transfer.station_new_id


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
    today = datetime.date.today()

    # Get the latest transfer_date for the patient
    latest_transfer_to_station = PatientTransfers.objects.filter(
        patient_id=patient_id,
        station_new_id=station_id,
        transfer_date__lte=today
    ).latest('transfer_date')

    if today - latest_transfer_to_station > 90:
        return True
    else:
        return False


def visited_at_daytime(transfer_date: datetime.date, today: datetime.date) -> bool:
    """Check if the patient's stay includes at least one day."""
    stay_duration = today - transfer_date
    return stay_duration.days >= 1


def visited_at_nighttime(transfer_date: datetime.date, today: datetime.date, now: datetime) -> bool:
    """Check if the patient's stay includes at least one night."""
    night_start = time(22, 0)  # 10 PM
    night_end = time(6, 0)  # 6 AM

    if transfer_date == today:
        if now.time() >= night_start or now.time() <= night_end:
            return True
    else:
        return True
    return False


def get_patients_visit_type(station_id: int) -> dict:
    """Return lists of patients for a single station classified by visit type.

    Args:
        station_id (int): The ID of the station.

    Returns:
        dict: A dictionary with lists of patients classified by visit type.
    """
    today = datetime.today().date()
    now = datetime.now()

    # Get all patients on station and initialize visit type lists
    all_patients = get_active_patients_on_station(station_id)
    stationary = []
    part_stationary = []
    acute = []
    undefined = []  # catch possible edges cases

    all_patients = get_active_patients_on_station(station_id)
    for patient_transfer in all_patients:
        transfer_date = patient_transfer.transfer_date.date()
        includes_day = visited_at_daytime(transfer_date, today)
        includes_night = visited_at_nighttime(transfer_date, today, now)

        # Check if stay includes day or night and classify patient
        if includes_day and includes_night:
            stationary.append(patient_transfer.patient)
        elif includes_day or includes_night:
            part_stationary.append(patient_transfer.patient)
        elif not includes_night and includes_day:
            acute.append(patient_transfer.patient)
        else:
            undefined.append(patient_transfer.patient)

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
