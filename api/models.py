from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    is_employee = models.BooleanField(default=False, verbose_name='Çalışan mı?')
    annual_leave_days = models.FloatField(default=15.0, verbose_name='Yıllık izin günleri')
    resume = models.FileField(upload_to='resumes/', null=True, blank=True, verbose_name='Özgeçmiş')
    low_leave_notified = models.BooleanField(default=False, verbose_name='Düşük izin bildirimi gönderildi')


class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(auto_now_add=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'date']
    
    def __str__(self):
        return f'{self.user} - {self.date}'


class LeaveRequest(models.Model):
    
    STATUS_CHOICES = (
        ('PENDING', 'Beklemede'),
        ('APPROVED', 'Onaylandı'),
        ('REJECTED', 'Reddedildi'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    
    class Meta:
        unique_together = ['user', 'start_date', 'end_date']
    
    def __str__(self):
        return f'{self.user} - {self.start_date} to {self.end_date}'
