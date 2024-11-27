"""Calculate the minutes each patient should receive care services."""
import json
from django.http import JsonResponse


def group_and_count_data(data: list) -> dict:
    """Group the data count the number of entries in each group.

    The data is grouped by care_service_category, care_service_range and care_service_task.
    The count of each group is also tracked.

    Args:
        data (list): The data to group and count.

    Returns:
        dict: The grouped and counted data.
    """
    data_groups = {'A': {}, 'S': {}, 'A_Value': 0, 'S_Value': 0}
    for entry in data:
        category = entry['field__short']
        range = entry['severity']
        task = entry['category__name']

        # Add keys if not already in data_groups
        if range not in data_groups[category]:
            data_groups[category][range] = {}
        if task not in data_groups[category][range]:
            data_groups[category][range][task] = 0

        # Add the entry to the data_groups
        data_groups[category][range][task] += 1
    return data_groups


def choose_general_care_group(data: dict, barthel_index: int, expanded_barthel_index: int, mini_mental_status: int) \
        -> int:
    """According to the PPBV, the patient is assigned to a care group based on the provided data.

    A patient belongs to one of the following care groups if the statement is true:
    1. A1, if no other category
    2. A2, if at least 1 performance characteristic (from level A2) applies in at least 2 areas OR at least 1 from A2
       and max. 1 from A3
    3. A3, if at least 2 areas have at least 1 performance characteristic from A3
    4. A4, if at least 2 areas A4 and at least 1 of the following applies:
      - the patient has a Barthel Index between 0 and 35 points,
      - the patient has an extended Barthel Index between 0 and 15 points, or
      - the patient has scored between 0 and 16 points in the Mini-Mental Status Test.

    Args:
        data (dict): The data grouped by care_service_category and care_service_range.
        barthel_index (int): The barthel index of the patient.
        expanded_barthel_index (int): The expanded barthel index of the patient.
        mini_mental_status (int): The mini mental status of the patient.

    Returns:
        int: The care group the patient belongs to.
    """
    if ((4 in data and len(data[4]) > 1)
            and (barthel_index <= 35 or expanded_barthel_index <= 15 or mini_mental_status <= 16)):
        # Patient is in the highest care category
        return 4
    elif 3 in data and len(data[3]) > 1:
        # Patient is in the third care category
        return 3
    elif 2 in data and (len(data[2]) > 1 or (3 in data and len(data[3]) > 0)):
        # Patient is in the second care category
        return 2
    else:
        # Patient is in the first care category
        return 1


def choose_specific_care_group(data: dict) -> int:
    """According to the PPBV, the patient is assigned to a care group based on the provided data.

    A patient belongs to one of the following care groups if the statement is true:
    1. S1, if no other
    2. S2, if at least 1 allocation characteristic from S2
    3. S3, if at least 1 allocation characteristic from S3 applies
    4. S4, if at least 1 allocation characteristic from S3 applies in at least 2 areas

    Args:
        data (dict): The data grouped by care_service_category and care_service_range.

    Returns:
        int: The care group the patient belongs to.
    """
    if 3 in data and len(data[3]) > 1:
        # Patient is in the highest care category
        return 4
    elif 3 in data:
        # Patient is in the third care category
        return 3
    elif 2 in data:
        # Patient is in the second care category
        return 2
    else:
        # Patient is in the first care category
        return 1


def sum_minutes(a_value: str, s_value: str, body: dict) -> int:
    """Sum up the minutes of the provided data.

    Args:
        a_value (str): The severity of the A group.
        s_value (str): The severity of the S group.
        body (dict): Additional data influencing the minutes.

    Returns:
        int: The sum of the minutes.
    """
    minutes = 33  # Base value
    if body['is_in_isolation']:
        minutes = 123  # Base value for isolation

    # Data taken from the PPBV (TODO: Outsource this to somewhere else)
    minutes_per_classification = {
        "A1": {
            "S1": 59,
            "S2": 76,
            "S3": 112,
            "S4": 151
        },
        "A2": {
            "S1": 114,
            "S2": 131,
            "S3": 167,
            "S4": 206
        },
        "A3": {
            "S1": 203,
            "S2": 220,
            "S3": 256,
            "S4": 295
        },
        "A4": {
            "S1": 335,
            "S2": 352,
            "S3": 388,
            "S4": 427
        }
    }

    minutes += minutes_per_classification[f'A{a_value}'][f'S{s_value}']

    return minutes


def calculate_care_minutes(body_data: dict) -> int:
    """Calculate the minutes each patient should receive care services for.

    The body_data should contain the following:
    - selected_care_services: A list of care services the patient should receive
      (same format as provided by the handle_questions endpoint).
    - barthel_index: The barthel index of the patient.
    - expanded_barthel_index: The expanded barthel index of the patient.
    - mini_mental_status: The mini mental status of the patient.

    Args:
        body_data (dict): The data to calculate the minutes from.

    Returns:
        int: The minutes the patient should receive care services.
        int: The severity of the general care group.
        int: The severity of the specific care group.
    """
    # Sort data to iterate over it
    data_groups = group_and_count_data(body_data['selected_care_services'])

    # Calculate service category's severity
    a_index = choose_general_care_group(
        data_groups['A'],
        body_data['barthel_index'],
        body_data['expanded_barthel_index'],
        body_data['mini_mental_status']
    )
    s_index = choose_specific_care_group(data_groups['S'])

    # Calculate the minutes accordingly
    return sum_minutes(a_index, s_index, body_data), a_index, s_index


def handle_calculations(request):
    """Endpoint to calculate the minutes a caregiver has time for caring for a patient.

    Args:
        request (HttpRequest): The request object.

    Returns:
        JsonResponse: The response containing the calculated minutes.
    """
    if request.method == 'POST':
        body_data = json.loads(request.body)
        result_minutes, a_index, s_index = calculate_care_minutes(body_data)
        return JsonResponse({'minutes': result_minutes, 'a_index': a_index, 's_index': s_index}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed.'}, status=405)
