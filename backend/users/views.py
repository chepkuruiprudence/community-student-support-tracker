from rest_framework import generics
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from .serializers import RegisterSerializer
from rest_framework.permissions import AllowAny

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        token = Token.objects.get(key=response.data['token'])
        user = token.user

        return Response({
            "token": token.key,
            "user_id": user.id,
            "username": user.username,
            "is_student": user.is_student,
            "is_donor": user.is_donor
        })
