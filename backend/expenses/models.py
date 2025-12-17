from django.db import models
from django.conf import settings  # Use this instead of importing User directly
from needs.models import Need

class Expense(models.Model):
    need = models.ForeignKey(Need, on_delete=models.CASCADE, related_name='expenses')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    amount_spent = models.DecimalField(max_digits=10, decimal_places=2)
    spent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount_spent}"
