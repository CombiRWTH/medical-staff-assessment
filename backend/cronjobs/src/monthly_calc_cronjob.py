"""Run a cronjob at the beginning of each month and calculate the statistics for the previous month."""
# Set up Django.
import django
django.setup()
from backend.models import (Station, StationWorkloadDaily, StationWorkloadMonthly)  # noqa: E402
import datetime  # noqa: E402
from calendar import monthrange  # noqa: E402


def calculate_monthly_station_minutes(station: int, date: datetime.date, shift: str) -> dict:
    """Calculate the total minutes assigned for one station for one whole month.

    Args:
        station (int): The station id for which the toal minutes should be calculated
        shift: The shift for which the data is requested
        date (datetime.date): The first of the month for which the toal minutes should be claculated

    Returns:
        int: dict
    """

    # Filter the database entries for the correct month, station and shift
    days = StationWorkloadDaily.objects.filter(
        date__month=date.month, date__year=date.year, station=station, shift=shift)

    # If no entries where found return
    if not days.exists():
        return -1

    # Add up the minutes of all the filtered days to get a total for the month
    minutes_total = 0
    patients_total = 0
    caregivers_total = 0
    for entry in days:
        minutes_total += entry['minutes_total']
        patients_total += entry['patients_total']
        caregivers_total += entry['caregivers_total']

    return {"minutes_total": minutes_total, "patients_total": patients_total, "caregivers_total": caregivers_total}


def calculate():
    date = datetime.today() - datetime.timedelta(days=1)  # Get previous month
    stations = Station.objects.all()
    for station in stations:
        days_in_month = monthrange(date.year, date.month)

        """Compute statistics for all the day shifts"""

        dict_res_day = calculate_monthly_station_minutes(station, date, 'DAY')
        patients_avg = dict_res_day['patients_total'] / days_in_month
        caregivers_avg = dict_res_day['caregivers_total'] / days_in_month

        # According to article 4.2 of the PPBV
        suggested_caregivers_avg = (dict_res_day['minutes_total'] / 38.5) / days_in_month

        StationWorkloadMonthly.objects.create(
            station=station,
            month=date,
            shift='DAY',
            patients_avg=patients_avg,
            actual_caregivers_avg=caregivers_avg,
            suggested_caregivers_avg=suggested_caregivers_avg,
            minutes_total=dict_res_day['minutes_total'],
            shifts_per_caregiver=suggested_caregivers_avg / caregivers_avg
        )

        """Compute statistics for all the night shifts"""

        dict_res_day = calculate_monthly_station_minutes(station, date, 'NIGHT')
        patients_avg = dict_res_day['patients_total'] / days_in_month
        caregivers_avg = dict_res_day['caregivers_total'] / days_in_month
        patients_pers_caregiver_avg = dict_res_day['patients_total'] / dict_res_day['caregivers_total']

        # According to article 4.3 of the PPBV
        patient_caregiver_ratio = 20  # Should be changable according to "Pflegepersonaluntergrenzen-Verordnung"
        suggested_caregivers_avg = patients_pers_caregiver_avg / patient_caregiver_ratio
        if suggested_caregivers_avg < 1:
            suggested_caregivers_avg = 1

        StationWorkloadMonthly.objects.create(
            station=station,
            month=date,
            shift='NIGHT',
            patients_avg=patients_avg,
            actual_caregivers_avg=caregivers_avg,
            suggested_caregivers_avg=suggested_caregivers_avg,
            minutes_total=dict_res_day['minutes_total'],
            shifts_per_caregiver=suggested_caregivers_avg / caregivers_avg
        )


if __name__ == '__main__':
    calculate()
