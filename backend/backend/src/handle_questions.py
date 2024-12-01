"""Provide questions for the frontend to display and handle the submission of answers."""
import json
import datetime as datetime

from django.http import JsonResponse

from ..models import (CareServiceOption, DailyClassification,
                      IsCareServiceUsed, Patient, Station, PatientTransfers)


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
            'name',
            'severity',
            'description',
        )
    )
    # Get the patient's admission and discharge dates
    try:
        patient = PatientTransfers.objects.get(id=patient_id)
        admission_date = patient.admission_date
        discharge_date = patient.discharge_date
    except PatientTransfers.DoesNotExist:
        admission_date = None
        discharge_date = None

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
    grouped_questions = []
    for question in questions:
        field = question['field__name']
        field_short = question['field__short']
        category = question['category__name']
        severity = question['severity']

        # Check if an entry with same name as field already exists
        matches = [field == group['name'] for group in grouped_questions]
        if True not in matches:
            grouped_questions.append({"name": field, "short": field_short, "categories": []})
            field_index = 0
        else:
            field_index = matches.index(True)

        # Check if an entry with same name as category already exists
        matches = [category == group['name'] for group in grouped_questions[field_index]['categories']]
        if True not in matches:
            grouped_questions[field_index]['categories'].append({"name": category, "severities": []})
            category_index = 0
        else:
            category_index = matches.index(True)

        # Check if an entry with same severity already exists
        matches = [
            severity == group['severity']
            for group in grouped_questions[field_index]['categories'][category_index]['severities']
        ]
        if True not in matches:
            grouped_questions[field_index]['categories'][category_index]['severities'].append(
                {"severity": severity, "questions": []}
            )
            severity_index = 0
        else:
            severity_index = matches.index(True)

        # Add the question to the corresponding severity
        grouped_questions[field_index]['categories'][category_index]['severities'][severity_index]['questions'].append(
            question
        )

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
    grouped_questions = group_questions(questions)
    classification_information['care_service_options'] = grouped_questions
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
        date=date.today(),
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
