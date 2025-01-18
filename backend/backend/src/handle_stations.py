"""Endpoint to retrieve information per station."""
from datetime import timedelta

from django.db.models import Count, Q, Sum, Value
from django.db.models.functions import Coalesce, ExtractDay
from django.http import JsonResponse
from django.utils import timezone

from ..models import (
    DailyClassification,
    DailyPatientData,
    Station,
    StationWorkloadDaily,
)


def get_stations_analysis(frequency: str):
    """Get station workload analysis based on frequency.

    Args:
        frequency (str): The frequency for the analysis, 'daily' or 'monthly'.

    Returns:
        list: A list of station workload data.
    """
    if frequency == "daily":
        # If 'daily', fetch the current day's data
        today = timezone.now().date()
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
        today = timezone.now()
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
        total_sum = 0
        for item in daily_data:
            station_id = item['station__id']
            if station_id not in stations:
                stations[station_id] = {
                    "id": station_id,
                    "name": item['station__name'],
                    "sum": 0,
                    "data": []
                }
            stations[station_id]["data"].append({
                "day": item['day'],
                "minutes": item['minutes']
            })
            stations[station_id]["sum"] += item['minutes']
            total_sum += item['minutes']

        # Add one entry for the sum over all stations
        stations["total"] = {
            "id": "",
            "name": "",
            "sum": total_sum,
            "data": []
        }
        return list(stations.values())

    else:
        raise ValueError("Invalid frequency. Use 'daily' or 'monthly'.")


def get_missing_classifications_for_station(station_id: int) -> int:
    """Get number of todays missing classifications for station.

    Args:
        station_id (int): The ID of the station in the database.

    Returns:
        int: The number of missing classifications.
    """
    today = timezone.now().date()
    missing_classifications = 0

    patients = (
        DailyPatientData.objects.filter(station=station_id, date=today)
        .values_list("patient", flat=True)
        .distinct()
    )

    for patient_id in patients:
        classification = DailyClassification.objects.filter(
            patient=patient_id, date=today, station=station_id
        ).first()

        if classification is None:
            missing_classifications += 1

    return missing_classifications


def get_all_stations() -> list:
    """Get all stations with todays patient count and missing classifications.

    Returns:
        list: Stations.
    """
    today = timezone.now().date()
    stations = (
        Station.objects.annotate(
            patientCount=Count(
                'dailypatientdata__patient',
                filter=Q(dailypatientdata__date=today),
            )
        )
        .values("id", "name", "patientCount")
        .order_by("name")
    )

    stations_list = list(stations)

    for station in stations_list:
        station_id = station["id"]
        missing_classifications = get_missing_classifications_for_station(station_id)
        station["missing_classifications"] = missing_classifications

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
