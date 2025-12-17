from django.http import JsonResponse

def root(request):
    return JsonResponse({"message": "Welcome to Community Student Support Tracker API"})
