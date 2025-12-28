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

# views.py

class NeedViewSet(ModelViewSet):
    serializer_class = NeedSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'is_student') and user.is_student:
            return Need.objects.filter(student=user)
        return Need.objects.all()

    # --- ADD THIS SECTION BELOW ---
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def pledge(self, request, pk=None):
        need = self.get_object()
        amount = request.data.get('amount')

        if not amount:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Convert to decimal for safe money math
            pledge_amount = Decimal(str(amount))
            
            # Update the need's pledged amount
            need.amount_pledged += pledge_amount
            
            # Logic: If pledged >= required, set status to funded
            if need.amount_pledged >= need.amount_required:
                need.status = 'funded'
                
            need.save()
            
            return Response({
                "status": "pledge recorded",
                "new_total": need.amount_pledged
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  
    # RESTRICT UPDATE/DELETE to the owner
    def perform_update(self, serializer):
        if serializer.instance.student != self.request.user:
            raise PermissionDenied("You cannot edit this need.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.student != self.request.user:
            raise PermissionDenied("You cannot delete this need.")
        instance.delete()

    