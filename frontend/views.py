from django.shortcuts import render
from backend.models import Station
from datetime import datetime, timedelta


def home(request):
    return render(request, 'frontend/home.html')


def analysis(request):
    return render(request, 'frontend/analysis.html')


def stations(request):
    # all_stations = Station.objects.all()  # Retrieve all stations from the database
    all_stations = [
        Station(id=i, name=f'Station {i}', is_intensive_care=False, is_child_care_unit=False,
                patients_per_caregiver_ratio=1.5 + i * 0.1)
        for i in range(1, 11)
    ]

    context = {
        'stations': all_stations
    }
    return render(request, 'frontend/stations.html', context)


def station_patient_list(request, id):
    # Hardcoded patients assigned to the station
    hardcoded_patients = [
        {"id": 1, "first_name": "Alice", "last_name": "Smith", "daily_today": True, "station_id": 1},
        {"id": 2, "first_name": "Bob", "last_name": "Johnson", "daily_today": True, "station_id": 1},
        {"id": 3, "first_name": "Charlie", "last_name": "Williams", "daily_today": False, "station_id": 1},
        {"id": 4, "first_name": "Diana", "last_name": "Brown", "daily_today": True, "station_id": 1},
        {"id": 5, "first_name": "Edward", "last_name": "Davis", "daily_today": True, "station_id": 1},
        {"id": 6, "first_name": "Fiona", "last_name": "Clark", "daily_today": True, "station_id": 1},
        {"id": 7, "first_name": "George", "last_name": "Harris", "daily_today": False, "station_id": 3},
        {"id": 8, "first_name": "Hannah", "last_name": "Lewis", "daily_today": True, "station_id": 4},
        {"id": 9, "first_name": "Ian", "last_name": "Walker", "daily_today": False, "station_id": 2},
        {"id": 10, "first_name": "Julia", "last_name": "King", "daily_today": True, "station_id": 5},
    ]

    context = {
        'id': id,  # Station ID
        'patients': hardcoded_patients,  # Pass the hardcoded patients to the template
    }
    return render(request, 'frontend/station_patient_list.html', context)


def classification(request, id, patient_id, date):
    current_date = datetime.strptime(date, '%Y-%m-%d')
    # Calculate previous and next dates
    previous_date = (current_date - timedelta(days=1)).strftime('%Y-%m-%d')
    next_date = (current_date + timedelta(days=1)).strftime('%Y-%m-%d')
    # Example patient name - replace with actual database query when possible
    patient_name = "Max Mustermann"
    next_patient_id = int(patient_id) + 1

    checkbox_data = [
        {
            "id": 1,
            "field_id__name": "Allgemeine Pflege",
            "field_id__short": "A",
            "category_id__name": "Körperpflege",
            "name": "A-koerperpflege-1-1",
            "severity": 1,
            "description": "Alle Patienten, die nicht A2, A3 oder A4 zugeordnet werden.",
            "is_true": False
        },
        {
            "id": 2,
            "field_id__name": "Allgemeine Pflege",
            "field_id__short": "A",
            "category_id__name": "Körperpflege",
            "name": "A-koerperpflege-2-1",
            "severity": 2,
            "description": "Patient benötigt überwiegend selbständige Hilfe.",
            "is_true": True
        },
        {
            "id": 3,
            "field_id__name": "Spezielle Pflege",
            "field_id__short": "S",
            "category_id__name": "Körperpflege",
            "name": "S-koerperpflege-3-1",
            "severity": 3,
            "description": "Hilfe durch Pflegekräfte notwendig.",
            "is_true": False
        },
        {
            "id": 4,
            "field_id__name": "Spezielle Pflege",
            "field_id__short": "S",
            "category_id__name": "Körperpflege",
            "name": "S-koerperpflege-4-1",
            "severity": 4,
            "description": "Vollständige Hilfe durch Pflegekraft erforderlich.",
            "is_true": True
        }
    ]

    context = {
        'id': id,
        'patient_id': patient_id,
        'date': current_date.strftime('%d.%m.%Y'),  # Format for display
        'previous_date_url': f"/stations/{id}/{patient_id}/{previous_date}",
        'next_date_url': f"/stations/{id}/{patient_id}/{next_date}",
        'next_patient_url': f"/stations/{id}/{next_patient_id}/{date}",
        'patient_name': patient_name,
        'category1': "A2",
        'category2': "S2",
        'minutes': 163,
        'isInIsolation': True,
        'isDayOfDischarge': True,
        'isDayOfAdmission': True,
        'assessmentData': checkbox_data
    }

    

    return render(request, 'frontend/classification.html', context)


def tables2(request):
    return render(request, 'frontend/tables2.html')


def tables3(request):
    # Sample data for the table
    checkbox_data = [
        {
            "id": 1,
            "field_id__name": "Allgemeine Pflege",
            "field_id__short": "A",
            "category_id__name": "Körperpflege",
            "name": "A-koerperpflege-1-1",
            "severity": 1,
            "description": "Alle Patienten, die nicht A2, A3 oder A4 zugeordnet werden.",
            "is_true": False
        },
        {
            "id": 2,
            "field_id__name": "Allgemeine Pflege",
            "field_id__short": "A",
            "category_id__name": "Körperpflege",
            "name": "A-koerperpflege-2-1",
            "severity": 2,
            "description": "Patient benötigt überwiegend selbständige Hilfe.",
            "is_true": True
        },
        {
            "id": 3,
            "field_id__name": "Spezielle Pflege",
            "field_id__short": "S",
            "category_id__name": "Körperpflege",
            "name": "S-koerperpflege-3-1",
            "severity": 3,
            "description": "Hilfe durch Pflegekräfte notwendig.",
            "is_true": False
        },
        {
            "id": 4,
            "field_id__name": "Spezielle Pflege",
            "field_id__short": "S",
            "category_id__name": "Körperpflege",
            "name": "S-koerperpflege-4-1",
            "severity": 4,
            "description": "Vollständige Hilfe durch Pflegekraft erforderlich.",
            "is_true": True
        }
    ]

    context = {
        'assessmentData': checkbox_data
    }

    return render(request, 'frontend/tables3.html', context)
