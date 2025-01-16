"""Runs a cronjob that calculates the daily sum of minutes for each station."""
import django
django.setup()
from backend.models import Station, StationWorkloadDaily, DailyClassification  # noqa: E402
from datetime import date  # noqa: E402


def get_classifications_per_station(date: date, station: str) -> list:
    """Find and return the classifications for a station on a specific date.

    Args:
        date (date): The date to look for.
        station (str): The station to look for.

    Returns:
        list: All classifications for the station on the date.
    """
    classifications = DailyClassification.objects.filter(
        date=date,
        station=station,
    ).values('result_minutes')
    return list(classifications)


def calculate_minutes_per_station(station_id: int, date: date) -> None:
    """Calculate the amount of minutes needed for each station on that day.

    Args:
        station_id (int): The ID of the station to calculate the minutes for.

    Returns:
        None
    """
    classifications = get_classifications_per_station(date, station_id)
    minutes = 0
    for classification in classifications:
        minutes += classification['result_minutes']

    # Compute the 'Vollzeitäquivalente' (VZÄ) according to the PPBV
    suggested_caregivers = minutes / (38.5 * 60)

    # Create a new StationWorkloadDaily object.
    StationWorkloadDaily.objects.update_or_create(
        station=station_id,
        date=date,
        shift='DAY',
        defaults={
            'minutes_total': minutes,
            'PPBV_suggested_caregivers': suggested_caregivers
        }
    )


def calculate_minutes_for_all_stations() -> None:
    """Calculate the amount of minutes needed for each station on that day."""
    stations = Station.objects.all()
    today = date.today()
    for station in stations:
        calculate_minutes_per_station(station.id, today)


if __name__ == '__main__':
    calculate_minutes_for_all_stations()
