from datetime import timedelta, datetime, date
from django.db.models import Sum, Value, Count, Subquery, OuterRef
from django.db.models.functions import Coalesce, ExtractDay
from django.http import JsonResponse
from ..models import StationWorkloadDaily, Station, PatientTransfers


def get_stations_analysis(frequency: str):
    """Get station workload analysis based on frequency.

    Args:
        frequency (str): The frequency for the analysis, 'daily' or 'monthly'.

    Returns:
        list: A list of station workload data.
    """
    if frequency == "daily":
        # If 'daily', fetch the current day's data
        today = datetime.now().date()
        daily_workload = (
            StationWorkloadDaily.objects
            .filter(date=today)
            .order_by('station__id', 'date')
            .values('station__id', 'station__name', 'date')
            .annotate(minutes=Sum('minutes_total'))
        )
        return [
            {
                "id": item['station__id'],
                "name": item['station__name'],
                "date": item['date'],
                "minutes": item['minutes']
            }
            for item in daily_workload
        ]

    elif frequency == "monthly":
        # Calculate the current month's date range
        today = datetime.now()
        start_date = today.replace(day=1)
        next_month = (today.replace(day=28) + timedelta(days=4)).replace(day=1)
        end_date = next_month - timedelta(days=1)

        # Query daily data for the current month
        daily_data = (
            StationWorkloadDaily.objects
            .filter(date__gte=start_date, date__lte=end_date)
            .annotate(day=ExtractDay('date'))
            .values('station__id', 'station__name', 'day')
            .annotate(minutes=Coalesce(Sum('minutes_total'), Value(0)))
            .order_by('station__id', 'day')
        )

        # Structure the data for the desired output
        stations = {}
        for item in daily_data:
            station_id = item['station__id']
            if station_id not in stations:
                stations[station_id] = {
                    "id": station_id,
                    "name": item['station__name'],
                    "data": []
                }
            stations[station_id]["data"].append({
                "day": item['day'],
                "minutes": item['minutes']
            })

        return list(stations.values())

    else:
        raise ValueError("Invalid frequency. Use 'daily' or 'monthly'.")


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
        patientCount=Coalesce(Subquery(patients_count_subquery), Value(0))
    ).values("id", "name", "patientCount")

    return list(stations)


def handle_stations_analysis(request) -> JsonResponse:
    """Endpoint to retrieve station workload analysis.

    Args:
        request (HttpRequest): The request object.

    Returns:
        JsonResponse: The response containing the station workload data.
    """
    if request.method == 'GET':
        frequency = request.GET.get('frequency')
        if not frequency:
            return JsonResponse({"error": "The 'frequency' query parameter is required."}, status=400)

        try:
            stations = get_stations_analysis(frequency)
            return JsonResponse(stations, safe=False)
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


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
