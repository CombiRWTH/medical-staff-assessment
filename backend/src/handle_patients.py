"""Provide an endpoint to retrieve all current patients for a station."""
import datetime
from django.http import JsonResponse
from ..models import Patient, DailyClassification
from django.db.models import Case, When, BooleanField


def get_patients_per_station(station_id: int) -> list:
    """Get all patients assigned to a station and add a classified parameter.

    The classified parameter is set to True if the patient has already been classified today.
    A patient is assigned to a station if the patient has been classified for the station yesterday or today.
    This is because we have no access to the internal database of the hospital.

    Args:
        station_id (int): The ID of the station in the database.

    Returns:
        list: The patients assigned to the station.
    """
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)

    # Query DailyClassification for the relevant time range and station
    classifications = DailyClassification.objects.filter(
        station=station_id,
        date__in=[yesterday, today]
    ).values('patient', 'date')

    # Annotate patients with the classified status
    patients = Patient.objects.filter(
        id__in=classifications.values('patient')
    ).annotate(
        classified_today=Case(
            When(
                id__in=classifications.filter(date=today).values('patient'),
                then=True
            ),
            default=False,
            output_field=BooleanField()
        )
    ).values()

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
        return JsonResponse(get_patients_per_station(station_id), safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
