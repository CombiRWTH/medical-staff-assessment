from django.http import JsonResponse


def api_home(request):
    return JsonResponse({"message": "Welcome to the Backend API!"})
