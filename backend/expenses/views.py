from rest_framework.viewsets import ModelViewSet
from .models import Expense
from expenses.serializers import ExpenseSerializer

class ExpenseViewSet(ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
