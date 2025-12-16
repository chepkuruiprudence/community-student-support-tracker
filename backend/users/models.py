from django.contrib.auth.models import User, AbstractUser
from django.db import models

class Profile(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('donor', 'Donor'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class User(AbstractUser):
    is_student = models.BooleanField(default=True)
    is_donor = models.BooleanField(default=False)
