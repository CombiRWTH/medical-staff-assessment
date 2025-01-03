"""Run a cronjob each night and calculate the amount of caregivers and time needed for each station."""
# Set up Django.
import django
django.setup()
from backend.models import Station, StationWorkloadDaily, DailyPatientData  # noqa: E402
import datetime  # noqa: E402


def get_number_of_caregivers(station_id: int, date: datetime.date) -> int:
    """Return the suggested number of caregivers according to the PPBV.

    Args:
        station_id: The ID of the station.
        date: The date to calculate the number of caregivers for.

    Returns:
        The suggested number of caregivers.
    """
    # Get the number of patients for the station in the nightshift.
    number_of_patients = DailyPatientData.objects.filter(
        station=station_id,
        date=date,
        night_stay=True
    ).count()
    # Get the number of caregivers for the station.
    caregiver_ratio = Station.objects.get(id=station_id).max_patients_per_caregiver
    number_of_caregivers = number_of_patients / caregiver_ratio

    # If the number of caregivers is less than 1, return 1 (according to the PPBV).
    if number_of_caregivers < 1:
        return 1
    return number_of_caregivers


def calculate_caregivers_per_station() -> None:
    """Run the nightshift cronjob.

    Calculate the amount of caregivers needed for each station on that shift.
    """
    stations = Station.objects.all()
    for station in stations:
        # Calculate the amount of caretakers on today's nightshift.
        night_shift_start = datetime.date.today() - datetime.timedelta(days=1)
        number_of_caregivers = get_number_of_caregivers(station.id, night_shift_start)

        # Create a new StationWorkloadDaily object.
        StationWorkloadDaily.objects.update_or_create(
            station=station,
            date=night_shift_start,
            shift='NIGHT',
            defaults={
                'PPBV_suggested_caregivers': number_of_caregivers
            }
        )


if __name__ == '__main__':
    calculate_caregivers_per_station()
