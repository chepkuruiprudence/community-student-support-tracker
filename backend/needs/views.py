from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Need
from .serializers import NeedSerializer
from .permissions import IsStudent, IsDonor


class NeedViewSet(ModelViewSet):
    serializer_class = NeedSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        # Students only see THEIR needs
        return Need.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, IsDonor]
    )
    def pledge(self, request, pk=None):
        need = self.get_object()
        amount = request.data.get("amount")

        if not amount:
            return Response(
                {"error": "Amount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)
        except ValueError:
            return Response(
                {"error": "Invalid amount"},
                status=status.HTTP_400_BAD_REQUEST
            )

        need.amount_pledged += amount

        if need.amount_pledged >= need.amount_required:
            need.status = "funded"

        need.save()

        return Response(
            {"message": "Pledge successful"},
            status=status.HTTP_200_OK
        )
