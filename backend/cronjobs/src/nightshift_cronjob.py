"""Run a cronjob each night and calculate the amount of caregivers and time needed for each station."""
# Set up Django.
import django
django.setup()
from backend.models import Station, StationWorkloadDaily, DailyPatientData  # noqa: E402
import datetime  # noqa: E402


def get_number_of_caregivers(station_id: int, date: datetime.date) -> int:
    """Return the fulltime equivalents of caregivers needed for a station on a specific date.

    Args:
        station_id: The ID of the station.
        date: The date to calculate the number of caregivers for.

    Returns:
        The suggested fulltime equivalents of caregivers needed for the station.
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

    shift_duration = 8  # 10 PM until 6 AM
    fulltime_caregiver = 38.5  # 38.5 hours per week

    # Calculate the needed 'Vollzeitäquivalente' (full-time equivalents) according to the PPBV.
    fulltime_equivalents = number_of_caregivers * shift_duration / fulltime_caregiver

    # If the number of 'Vollzeitäquivalente' is less than 1, return 1 (according to the PPBV).
    if fulltime_equivalents < 1:
        return 1
    return fulltime_equivalents


def calculate_caregivers_per_station() -> None:
    """Run the nightshift cronjob.

    Calculate the amount of caregivers needed for each station on that shift.
    """
    stations = Station.objects.all()
    for station in stations:
        # Calculate the amount of caretakers on today's nightshift.
        night_shift_start = datetime.date.today() - datetime.timedelta(days=1)
        number_of_equivalents = get_number_of_caregivers(station.id, night_shift_start)
        minutes = number_of_equivalents * 38.5 * 60

        # Create a new StationWorkloadDaily object.
        StationWorkloadDaily.objects.update_or_create(
            station=station,
            date=night_shift_start,
            shift='NIGHT',
            defaults={
                'PPBV_suggested_caregivers': number_of_equivalents,
                'minutes_total': minutes,
            }
        )


if __name__ == '__main__':
    calculate_caregivers_per_station()
