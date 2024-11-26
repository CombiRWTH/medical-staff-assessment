"""Provide stations for the frontend to display  """

from django.http import JsonResponse
from ..models import Station

def get_all_stations() -> list:
    """Get all stations stored in the db.

    Returns:
        list: Stations.
    """
    return list(Station.objects.values())

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
    