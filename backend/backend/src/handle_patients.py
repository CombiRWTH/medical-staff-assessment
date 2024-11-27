"""Provide an endpoint to retrieve all current patients for a station."""
import datetime
from django.http import JsonResponse
from ..models import Patient, DailyClassification, PatientTransfers
from django.db.models import Subquery, OuterRef


def get_patients_per_station(station_id: int) -> list:
    """Get all patients assigned to a station and add the date the patient was last classified on that station.

    Args:
        station_id (int): The ID of the station in the database.

    Returns:
        list: The patients assigned to the station.
    """
    today = datetime.date.today()

    # Get all patients assigned to the given station
    patients = Patient.objects.filter(
        id__in=Subquery(
            PatientTransfers.objects.filter(
                station_new_id=station_id,
                discharge_date__gte=today
            ).values('patient')
        )
    )

    # Add the date the patient was last classified on that station
    patients = patients.annotate(
        last_classification=Subquery(
            DailyClassification.objects.filter(
                patient=OuterRef('id'),
                date__lte=today,
                station=station_id
            )
            .order_by('-date')
            .values('date')[:1]
        )
    ).values('id', 'first_name', 'last_name', 'last_classification')

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
