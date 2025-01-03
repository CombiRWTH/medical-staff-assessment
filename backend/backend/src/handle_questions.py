"""Provide questions for the frontend to display and handle the submission of answers."""
import json
import datetime as datetime
from collections import defaultdict

from django.http import JsonResponse

from ..models import (CareServiceOption, DailyClassification,
                      IsCareServiceUsed, Patient, Station, DailyPatientData)


def add_selected_attribute(care_service_options: list, classification: dict) -> list:
    """Add the attribute if the care service was previously selected or not.

    Args:
        care_service_options (list): The care service options to which to add the 'selected' attribute.
        classification (dict): The classification of the patient.

    Returns:
        list: The care service options with the attribute if they were previously selected or not.
    """
    # If no classification exist, return the questions with everything unselected
    if classification is None:
        return [{**option, 'selected': False} for option in care_service_options]

    # Get all previous selected care services
    previous_selected_services = list(IsCareServiceUsed.objects.filter(
        classification=classification['id'],
    ).values('care_service_option'))

    # Add the attribute if the care service was previously selected or not
    for option in care_service_options:
        option['selected'] = any(
            previous_service['care_service_option'] == option['id']
            for previous_service in previous_selected_services
        )

    return care_service_options


def get_questions(station_id: int, patient_id: int, date: datetime.date) -> dict:
    """Get the questions and general information about the classification from the database.

    Args:
        station_id (int): The ID of the station.
        patient_id (int): The ID of the patient.
        date (date): The date of the classification.

    Returns:
        dict: The questions with the corresponding information for that date.
    """
    # Get the questions with the corresponding information
    care_service_options = list(
        CareServiceOption.objects.select_related('field', 'category').values(
            'id',
            'field__name',
            'field__short',
            'category__name',
            'category__short',
            'name',
            'severity',
            'description',
            'short'
        )
    )
    # Get the patient's admission and discharge dates
    daily_patient_data = DailyPatientData.objects.filter(
        patient=patient_id,
        station=station_id,
        date=date
    ).values('day_of_discharge', 'day_of_admission').first()
    admission_date = daily_patient_data['day_of_admission'] if daily_patient_data else None
    discharge_date = daily_patient_data['day_of_discharge'] if daily_patient_data else None

    # Get the classification of the patient for the specified date
    classification = DailyClassification.objects.filter(
        patient=patient_id,
        date=date,
        station=station_id,
    ).values().first()

    # Add the attribute if the care service was selected or not on that date
    care_service_options = add_selected_attribute(care_service_options, classification)

    return {
        'care_service_options': care_service_options,
        'care_time': classification['result_minutes'] if classification else 0,
        'is_in_isolation': classification['is_in_isolation'] if classification else False,
        'a_index': classification['a_index'] if classification else 0,
        's_index': classification['s_index'] if classification else 0,
        'barthel_index': classification['barthel_index'] if classification else 0,
        'expanded_barthel_index': classification['expanded_barthel_index'] if classification else 0,
        'mini_mental_status': classification['mini_mental_status'] if classification else 0,
        'admission_date': admission_date,
        'discharge_date': discharge_date,
    }


def group_questions(questions: list) -> list:
    """Group the questions by field, category and severity.

    Args:
        questions (list): The questions to group.

    Returns:
        list: The questions grouped by field, category and severity.
    """
    # Sort questions by id to always get the same order
    questions = sorted(questions, key=lambda x: (x['id']))
    grouped_questions = []

    def split_by_attribute(objects, attribute):
        grouped = defaultdict(list)

        for obj in objects:
            key = obj.get(attribute)
            grouped[key].append(obj)

        return grouped.values()

    fields = split_by_attribute(questions, "field__name")

    for field in fields:
        field_name = field[0]["field__name"]
        field_value = {
            "id": 1,  # TODO not accessible here
            "name": field_name,
            "short": field[0]["field__short"],
            "categories": []
        }

        categories = split_by_attribute(field, "category__name")

        for category in categories:
            category_name = category[0]['category__name']
            category_value = {
                "id": 1,  # TODO not accessible here
                "name": category_name,
                "short": category[0]['category__short'],  # TODO not accessible here
                "severities": []
            }
            severities = split_by_attribute(category, "severity")

            for severity in severities:
                severity_index = severity[0]['severity']
                severity_value = {
                    "severity": severity_index,
                    "questions": severity
                }

                category_value["severities"].append(severity_value)
            field_value["categories"].append(category_value)
        grouped_questions.append(field_value)

    return grouped_questions


def get_grouped_data(station_id: int, patient_id: int, date: datetime.date) -> dict:
    """Get the questions grouped by field, category, severity and general information about the classification.

    Args:
        station_id (int): The ID of the station.
        patient_id (int): The ID of the patient.
        date (date): The date of the classification.

    Returns:
        dict: The questions grouped by field, category, severity.
    """
    classification_information = get_questions(station_id, patient_id, date)
    questions = classification_information['care_service_options']
    del classification_information['care_service_options']
    grouped_questions = group_questions(questions)
    classification_information['careServices'] = grouped_questions
    return classification_information


def submit_selected_options(station_id: int, patient_id: int, date: datetime.date, body: dict) -> JsonResponse:
    """Save the questions to the database.

    Args:
        station_id (int): The ID of the station.
        patient_id (int): The ID of the patient.
        date (str): The date of the classification ('YYYY-MM-DD').
        body (dict): The body of the request containing the selected care services and more information.
    Returns:
        JsonResponse: The response containing the calculated minutes, the general and the specific care group.
    """
    # Create the classification entry if it does not exist
    patient = Patient.objects.get(id=patient_id)
    station = Station.objects.get(id=station_id)

    # Check if the classification already exists
    classification = DailyClassification.objects.filter(
        patient=patient,
        date=date,
    ).first()

    if classification is None:
        classification = DailyClassification.objects.create(
            patient=patient,
            date=date,
            is_in_isolation=False,
            result_minutes=0,
            a_index=0,
            s_index=0,
            station=station,
            room_name='Test Raum',
            bed_number=1,
            barthel_index=0,
            expanded_barthel_index=0,
            mini_mental_status=0,
        )

    # Update the selected care services
    care_service = CareServiceOption.objects.get(id=body['id'])
    if care_service is None:
        return JsonResponse({'error': 'Care service option not found.'}, status=404)
    if body['selected']:
        IsCareServiceUsed.objects.get_or_create(
            classification=classification,
            care_service_option=care_service,
        )
    else:
        IsCareServiceUsed.objects.filter(
            classification=classification,
            care_service_option=care_service,
        ).delete()

    return JsonResponse(get_grouped_data(station_id, patient_id, date), safe=False)


def handle_questions(request, station_id: int, patient_id: int, date: str) -> JsonResponse:
    """Endpoint to handle the submission and pulling of questions.

    Args:
        request (Request): The request object.
        station_id (int): The ID of the station.
        patient_id (int): The ID of the patient.
        date (str): The date of the classification ('YYYY-MM-DD').

    Returns:
        JsonResponse: The response sent back to the client depending on the type of request.
    """
    try:
        date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
    if request.method == 'PUT':
        # Handle the updating of questions
        body_data = json.loads(request.body)
        return submit_selected_options(station_id, patient_id, date, body_data)
    elif request.method == 'GET':
        # Handle the pulling of questions for a patient
        return JsonResponse(get_grouped_data(station_id, patient_id, date), safe=False)
    else:
        # Handle unsupported HTTP method types
        return JsonResponse({'error': 'Method not allowed'}, status=405)
