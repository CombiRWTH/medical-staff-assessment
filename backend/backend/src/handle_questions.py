"""Provide questions for the frontend to display and handle the submission of answers."""
import json
from datetime import date, datetime

from django.http import JsonResponse

from ..models import (CareServiceOption, DailyClassification,
                      IsCareServiceUsed, Patient, Station)
from .handle_calculations import calculate_care_minutes


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


def get_questions(patient_id: int, date: date) -> list:
    """Get the questions from the database.

    Args:
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
            'name',
            'severity',
            'description',
        )
    )

    # Get the classification of the patient for the specified date
    classification = DailyClassification.objects.filter(
        patient=patient_id,
        date=date,
    ).values().first()

    # Add the attribute if the care service was selected or not on that date
    care_service_options = add_selected_attribute(care_service_options, classification)

    return {
        'care_service_options': care_service_options,
        'care_time': classification['result_minutes'] if classification else 0,
        'is_in_isolation': classification['is_in_isolation'] if classification else False,
        'a_index': classification['a_index'] if classification else 0,
        's_index': classification['s_index'] if classification else 0,
    }


def has_missing_data(body: dict) -> bool:
    """Check if the body of the request contains all necessary information.

    Args:
        body (dict): The body of the request.

    Returns:
        bool: True if the body is missing information, False otherwise.
    """
    return ('is_in_isolation' not in body
            or 'data_accepted' not in body
            or 'station' not in body
            or 'room_name' not in body
            or 'bed_number' not in body
            or 'barthel_index' not in body
            or 'expanded_barthel_index' not in body
            or 'mini_mental_status' not in body
            or 'selected_care_services' not in body)


def submit_selected_options(patient_id: int, body: dict) -> JsonResponse:
    """Save the questions to the database.

    Args:
        patient_id (int): The ID of the patient.
        body (dict): The body of the request containing the selected care services and more information.
    Returns:
        JsonResponse: The response containing the calculated minutes, the general and the specific care group.
    """
    # Check if the body contains all necessary information
    if has_missing_data(body):
        return JsonResponse({'message': 'Missing information in the request.'}, status=400)

    # Create the classification entry
    patient = Patient.objects.get(id=patient_id)
    minutes_to_take_care, a_index, s_index = calculate_care_minutes(body)
    station = Station.objects.get(id=body['station'])
    classification = DailyClassification.objects.create(
        patient=patient,
        date=date.today(),
        is_in_isolation=body['is_in_isolation'],
        data_accepted=body['data_accepted'],
        result_minutes=minutes_to_take_care,
        a_index=a_index,
        s_index=s_index,
        station=station,
        room_name=body['room_name'],
        bed_number=body['bed_number'],
    )

    # Save the selected care services
    for care_service in body['selected_care_services']:
        care_service = CareServiceOption.objects.get(id=care_service['id'])
        IsCareServiceUsed.objects.create(
            classification=classification,
            care_service_option=care_service,
        )

    return JsonResponse({'minutes': minutes_to_take_care, 'a_index': a_index, 's_index': s_index}, status=200)


def handle_questions(request, patient_id: int, date: str) -> JsonResponse:
    """Endpoint to handle the submission and pulling of questions.

    Args:
        request (Request): The request
        patient_id (int): The ID of the patient.
        date (str): The date of the classification ('YYYY-MM-DD').

    Returns:
        JsonResponse: The response send back to the client depending on the type of request
    """
    try:
        date = datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
    if request.method == 'POST':
        # Handle the submission of questions
        body_data = json.loads(request.body)
        return submit_selected_options(patient_id, body_data)
    elif request.method == 'GET':
        # Handle the pulling of questions for a patient
        return JsonResponse(get_questions(patient_id, date), safe=False)
