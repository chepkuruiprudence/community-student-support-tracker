from rest_framework.viewsets import ModelViewSet
from .models import Expense
from expenses.serializers import ExpenseSerializer
from rest_framework.permissions import IsAuthenticated

class ExpenseViewSet(ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # A student can only see/edit/delete their own expenses
        return Expense.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)