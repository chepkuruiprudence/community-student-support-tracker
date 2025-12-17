from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    # Add your custom fields to admin
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role Info', {'fields': ('is_student', 'is_donor')}),
    )

admin.site.register(User, UserAdmin)
