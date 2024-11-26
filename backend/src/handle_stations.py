import json
from django.http import JsonResponse
from ..models import (DailyClassification, StationWorkloadDaily)


def calculate_daily_station_minutes(body_data: dict) -> int:
    """Calculate the total minutes assigned for one station for one day.

    The body_data should contain the following:
    - station: The ForeignKey which identifies a station
    - date: The date of the day for which the toal minutes should be claculated
    - caregivers_total: The amount of caregivers working in that station on the given date

    Args:
        body_data (dict): The data to calculate the minutes from.

    Returns:
        int: The total number of care minutes for on station over during day
        int: The fraction of minutes per caregiver for the given day
    """
    station = body_data['station']
    date = body_data['month']
    caregivers_total = body_data['caregivers_total']

    # Filter the database to get all the patients at the specifed station and day
    patients = DailyClassification.objects.filter(date__month=date, station=station)

    # Add up the minutes of all the patients to get a total for the day
    result_minutes = 0
    for entry in patients:
        result_minutes += entry['result_minutes']
    minutes_per_caregiver = caregivers_total / result_minutes

    return result_minutes, minutes_per_caregiver


def handle_daily_station_minutes(request):
    """Endpoint to calculate the total minutes assigned to a station for one day.

    Args:
        request (HttpRequest): The request object.

    Returns:
        JsonResponse: The response containing the calculated minutes.
    """
    if request.method == 'POST':
        body_data = json.loads(request.body)
        result_minutes, minutes_per_caregiver = calculate_daily_station_minutes(body_data)
        return JsonResponse({'minutes': result_minutes, 'minutes_per_caregiver': minutes_per_caregiver}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed.'}, status=405)


def calculate_monthly_station_minutes(body_data: dict) -> int:
    """Calculate the total minutes assigned for one station for one whole month.

    The body_data should contain the following:
    - station: The ForeignKey which identifies a station
    - shift: The shift for which the data is requested
    - date: The first of the month for which the toal minutes should be claculated

    Args:
        body_data (dict): The data to calculate the minutes from.

    Returns:
        int: The total number of care minutes for on station over during one month
    """
    station = body_data['station']
    shift = body_data['shift']
    date = body_data['month']

    # Filter the database entries for the correct month, station and shift
    days = StationWorkloadDaily.objects.filter(
        date__month=date.month, date__year=date.year, station=station, shift=shift)

    # Add up the minutes of all the days filtered days to get a total for the month
    result_minutes = 0
    for entry in days:
        result_minutes += entry['minutes_total']

    return result_minutes


def handle_monthly_station_minutes(request):
    """Endpoint to calculate the total minutes assigned to a station for one month.

    Args:
        request (HttpRequest): The request object.

    Returns:
        JsonResponse: The response containing the calculated minutes.
    """
    if request.method == 'POST':
        body_data = json.loads(request.body)
        result_minutes = calculate_monthly_station_minutes(body_data)
        return JsonResponse({'minutes': result_minutes}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed.'}, status=405)
    return
