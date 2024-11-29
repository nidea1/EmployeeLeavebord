from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import *

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_employee', 'annual_leave_days')
    list_filter = ('is_employee', 'is_staff', 'is_superuser')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Çalışan Bilgisi', {'fields': ('is_employee', 'annual_leave_days', 'resume', 'low_leave_notified')}),
    )

admin.site.register(User, UserAdmin)
admin.site.register(Attendance)
admin.site.register(LeaveRequest)