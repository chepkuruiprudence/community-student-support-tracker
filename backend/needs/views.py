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
        # Donors see everything
        return Need.objects.all()

    def perform_create(self, serializer):
        # Explicitly stop Donors from creating Needs
        if not self.request.user.is_student:
            raise PermissionDenied("Only students can create needs.")
        serializer.save(student=self.request.user)

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, IsDonor]
    )
    def pledge(self, request, pk=None):
        need = self.get_object()
        amount_raw = request.data.get("amount")

        if not amount_raw:
            return Response({"error": "Amount is required"}, status=400)

        try:
            # IMPORTANT: Convert to Decimal to match Database field type
            amount = Decimal(str(amount_raw))
            
            if amount <= 0:
                return Response({"error": "Amount must be positive"}, status=400)

            # Python math works correctly when both are Decimals
            need.amount_pledged += amount

            if need.amount_pledged >= need.amount_required:
                need.status = "funded"

            need.save()
            return Response({"message": "Pledge successful"}, status=200)

        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)