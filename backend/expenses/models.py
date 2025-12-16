from django.db import models
from django.contrib.auth.models import User
from needs.models import Need

class Expense(models.Model):
    need = models.ForeignKey(Need, on_delete=models.CASCADE, related_name='expenses')
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    amount_spent = models.DecimalField(max_digits=10, decimal_places=2)
    spent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount_spent}"
