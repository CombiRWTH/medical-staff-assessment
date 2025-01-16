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


def calculate_minutes_per_station() -> None:
    """Run the daily calculation cronjob.

    Calculate the amount of minutes needed for each station on that day.
    """
    print("Running daily calculation cronjob...")
    stations = Station.objects.all()
    for station in stations:
        # Calculate the amount of minutes for today.
        today = date.today()
        classifications = get_classifications_per_station(today, station.id)
        minutes = 0
        for classification in classifications:
            minutes += classification['result_minutes']

        # Create a new StationWorkloadDaily object.
        StationWorkloadDaily.objects.update_or_create(
            station=station,
            date=today,
            shift='DAY',
            defaults={
                'minutes_total': minutes,
            }
        )


if __name__ == '__main__':
    calculate_minutes_per_station()
