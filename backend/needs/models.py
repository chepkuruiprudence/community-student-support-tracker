from django.db import models
from django.conf import settings  # Use this instead of importing User directly

class Need(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('funded', 'Funded'),
    )

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='needs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount_required = models.DecimalField(max_digits=10, decimal_places=2)
    amount_pledged = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
