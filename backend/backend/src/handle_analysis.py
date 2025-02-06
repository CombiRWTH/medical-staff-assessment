"""This contains endpoints to return analysis data for the frontend."""
from django.http import JsonResponse
from ..models import StationWorkloadDaily, Station
from datetime import datetime, date


def get_should_vs_is_analysis(start: date, end: date) -> list:
    """Return the should vs is analysis data for all stations.

    Returns:
        list: The should vs is analysis data for each station.
    """
    stations = Station.objects.all()
    analysis_data = []
    for station in stations:
        workload = StationWorkloadDaily.objects.filter(
            station=station.id,
            date__gte=start,
            date__lte=end,
        ).order_by('-date').values('date', 'caregivers_total', 'PPBV_suggested_caregivers', 'shift')

        # The number of caregivers needed for that shift will be returned
        data = {
            'station_id': station.id,
            'station_name': station.name,
            'dataset_night': [
                {
                    'date': entry['date'],
                    'should': round(
                        entry['PPBV_suggested_caregivers'] * 38.5 / 8, 2
                    ) if entry['PPBV_suggested_caregivers'] else 0,
                    'is': round(entry['caregivers_total'], 2) if entry['caregivers_total'] else 0
                }
                for entry in workload if entry['shift'] == 'NIGHT'
            ],
            'dataset_day': [
                {
                    'date': entry['date'],
                    'should': round(
                        entry['PPBV_suggested_caregivers'] * 38.5 / 8, 2
                    ) if entry['PPBV_suggested_caregivers'] else 0,
                    'is': round(entry['caregivers_total'], 2) if entry['caregivers_total'] else 0
                }
                for entry in workload if entry['shift'] == 'DAY'
            ]
        }
        analysis_data.append(data)

    return analysis_data


def get_station_specific_analysis(station_id: int, start: date, end: date) -> dict:
    """Method to retrieve data for a specific station.

    Args:
        station_id (int): The id of the station.
        start (date): From where to start.
        end (date): Where to end.

    Returns:
        dict: The data for the specific station.
    """
    return next((data for data in get_should_vs_is_analysis(start, end) if data['station_id'] == station_id), None)


def handle_should_vs_is_analysis(request, start: str, end: str) -> JsonResponse:
    """Endpoint to retrieve coordinates for the is and should occupancy on stations.

    Args:
        request (HttpRequest): The request object.
        start (str): The start date for the analysis.
        end (str): The end date for the analysis.

    Returns:
        JsonResponse: The response containing the should vs is analysis data.
    """
    if request.method == 'GET':
        try:
            start = datetime.strptime(start, '%Y-%m-%d').date()
            end = datetime.strptime(end, '%Y-%m-%d').date()
            return JsonResponse(get_should_vs_is_analysis(start, end), safe=False)
        except ValueError:
            return JsonResponse({'error': 'Invalid date format. Please use YYYY-MM-DD.'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


def handle_station_specific_analysis(request, station_id: int, start: str, end: str) -> JsonResponse:
    """Endpoint to retrieve coordinates for the is and should occupancy on a specific station.

    Args:
        request (HttpRequest): The request object.
        station_id (int): The id of the station.
        start (str): The start date for the analysis.
        end (str): The end date for the analysis.

    Returns:
        JsonResponse: The response containing the should vs is analysis data.
    """
    if request.method == 'GET':
        try:
            start = datetime.strptime(start, '%Y-%m-%d').date()
            end = datetime.strptime(end, '%Y-%m-%d').date()
            return JsonResponse(get_station_specific_analysis(station_id, start, end), safe=False)
        except ValueError:
            return JsonResponse({'error': 'Invalid date format. Please use YYYY-MM-DD.'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
