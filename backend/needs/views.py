from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from decimal import Decimal # Use Decimal for money math

from .models import Need
from .serializers import NeedSerializer
from .permissions import IsStudent, IsDonor

class NeedViewSet(ModelViewSet):
    serializer_class = NeedSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'is_student') and user.is_student:
            return Need.objects.filter(student=user)
        return Need.objects.all()

    # RESTRICT UPDATE/DELETE to the owner
    def perform_update(self, serializer):
        if serializer.instance.student != self.request.user:
            raise PermissionDenied("You cannot edit this need.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.student != self.request.user:
            raise PermissionDenied("You cannot delete this need.")
        instance.delete()

    