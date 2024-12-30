"""Provide the endpoints for handling data imports."""

from io import BytesIO
from django.http import JsonResponse
import pandas as pd
from ..models import Patient, DailyPatientData, Station
from datetime import datetime, date, timedelta
from django.utils import timezone


def is_night_stay(date: date, admission_date: datetime, discharge_date: datetime) -> bool:
    """Check if the patient's stay includes time in night shift.

    Args:
        date (date): The date to calculate this for.
        admission_date (datetime): The datetime of the patient's admission.
        discharge_date (datetime): The datetime of the patient's discharge.

    Returns:
        bool: True if the patient stayed overnight, False otherwise.
    """
    night_start = timezone.make_aware(datetime.combine(date, datetime.min.time()) + timedelta(hours=22))
    night_end = timezone.make_aware(datetime.combine(date, datetime.min.time()) + timedelta(hours=6))
    admission_date = timezone.make_aware(admission_date)
    discharge_date = timezone.make_aware(discharge_date)
    if ((admission_date <= night_start <= discharge_date)
            or (admission_date >= night_start and discharge_date <= night_end)):
        return True
    return False


def is_day_stay(date: date, admission_date: datetime, discharge_date: datetime) -> bool:
    """Check if the patient's stay includes time in day shift.

    Args:
        date (date): The date to calculate this for.
        admission_date (datetime): The datetime of the patient's admission.
        discharge_date (datetime): The datetime of the patient's discharge.

    Returns:
        bool: True if the patient stayed during the day, False otherwise.
    """
    day_start = timezone.make_aware(datetime.combine(date, datetime.min.time()) + timedelta(hours=6))
    day_end = timezone.make_aware(datetime.combine(date, datetime.min.time()) + timedelta(hours=22))
    admission_date = timezone.make_aware(admission_date)
    discharge_date = timezone.make_aware(discharge_date)
    if ((admission_date <= day_start <= discharge_date)
            or (admission_date >= day_start and discharge_date <= day_end)):
        return True
    return False


def insert_patient_excel_into_db(df: pd.DataFrame, date: str) -> None:
    """Insert patient data from an excel file into the database.

    Args:
        df (DataFrame): The DataFrame containing the patient data.
        date (str): The date of the data.
    """
    # Print all names of the row
    date = datetime.strptime(date, '%Y-%m-%d').date()
    for _, row in df.iterrows():
        # Create missing patients
        first_name = row['Vorname']
        last_name = row['Nachname']
        patient_id = row['Patienten-ID']
        # Check if patient already exists
        if not Patient.objects.filter(id=patient_id).exists():
            Patient.objects.create(
                id=patient_id,
                first_name=first_name,
                last_name=last_name
            )

        # Add daily data
        DailyPatientData.objects.create(
            patient=Patient.objects.get(id=patient_id),
            station=Station.objects.get(name=row['Stationsname']),
            date=date,
            is_semi_stationary=row['Teilstationär'] == 'Ja',
            is_fully_stationary=row['Vollstationär'] == 'Ja',
            day_of_admission=timezone.make_aware(row['Aufnahmetag']),
            day_of_discharge=timezone.make_aware(row['Entlassungstag']),
            is_repeating_visit=row['Wiederkehrend'] == 'Ja',
            night_stay=is_night_stay(date, row['Aufnahmetag'], row['Entlassungstag']),
            day_stay=is_day_stay(date, row['Aufnahmetag'], row['Entlassungstag'])
        )


def handle_patient_data_import(request, date: str) -> JsonResponse:
    """Endpoint to import patient data.

    The body of the request should contain the excel file to be imported.

    Args:
        request (HttpRequest): The request object.
        date (str): The date of the data.

    Returns:
        JsonResponse: The response containing the success message.
    """
    if request.method == 'POST':
        try:
            file = BytesIO(request.body)
            df = pd.read_excel(file)
            insert_patient_excel_into_db(df, date)
            return JsonResponse({'message': 'File processed successfully'})
        except Exception as e:
            print('Error', e)
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
