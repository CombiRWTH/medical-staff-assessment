"""Provide stations for the frontend to display  """
from datetime import date

from django.db.models import Subquery, OuterRef, Count, Value
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from ..models import Station, Patient, PatientTransfers


def get_all_stations() -> list:
    """Get all stations stored in the db.

    Returns:
        list: Stations.
    """

    today = date.today()

    # Subquery to get the count of patients for each station
    patients_count_subquery = PatientTransfers.objects.filter(
        station_new_id=OuterRef('pk'),
        discharge_date__gte=today
    ).values('station_new_id').annotate(
        patient_count=Count('patient')
    ).values('patient_count')

    # Annotate each station with the number of patients
    stations = Station.objects.annotate(
        current_number_patients=Coalesce(Subquery(patients_count_subquery), Value(0))
    ).values()

    return list(stations)


def handle_stations(request) -> JsonResponse:
    """Endpoint to retrieve all current stations.

    Args:
        request (HttpRequest): The request object.

    Returns:
        JsonResponse: The response containing the stations.
    """
    if request.method == 'GET':
        return JsonResponse(get_all_stations(), safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
