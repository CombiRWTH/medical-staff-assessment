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

        data = {
            'station_id': station.id,
            'station_name': station.name,
            'dataset_night': [
                {
                    'date': entry['date'],
                    'should': entry['PPBV_suggested_caregivers'] if entry['PPBV_suggested_caregivers'] else 0,
                    'is': entry['caregivers_total'] if entry['caregivers_total'] else 0
                }
                for entry in workload if entry['shift'] == 'NIGHT'
            ],
            'dataset_day': [
                {
                    'date': entry['date'],
                    'should': entry['PPBV_suggested_caregivers'],
                    'is': entry['caregivers_total']
                }
                for entry in workload if entry['shift'] == 'DAY'
            ]
        }
        analysis_data.append(data)

    return analysis_data


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
