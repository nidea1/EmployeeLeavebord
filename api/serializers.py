from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone

from .models import *


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Kullanıcı için parola.",
    )

    class Meta:
        model = User
        fields = "__all__"
        read_only_fields = [
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "last_login",
            "groups",
            "user_permissions",
        ]
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": False,
                "allow_blank": True,
                "help_text": "Kullanıcı için parola.",
            },
        }
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class AttendanceSerializer(serializers.ModelSerializer):
    late_time = serializers.SerializerMethodField(
        help_text="Planlanan başlangıç saatinden sonra geç kalma dakikası."
    )
    user = serializers.CharField(
        source="user.username", read_only=True, help_text="Katılımcının kullanıcı adı."
    )
    date = serializers.DateField(read_only=True, help_text="Katılım tarihi.")

    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ["user", "date", "start_time", "end_time", "late_time"]

    def get_late_time(self, obj):
        job_start_time = timezone.localtime().replace(hour=8, minute=0, second=0)
        if obj.start_time > job_start_time:
            late_minutes = (obj.start_time - job_start_time).seconds // 60
            return late_minutes
        return None


class LeaveRequestSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), help_text="İzin talep eden kullanıcının kimliği.", required=False
    )
    start_date = serializers.DateField(help_text="İzin başlangıç tarihi.")
    end_date = serializers.DateField(help_text="İzin bitiş tarihi.")
    
    class Meta:
        model = LeaveRequest
        fields = "__all__"


class MonthlyWorkReportSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(help_text="Kullanıcının kimliği.")
    username = serializers.CharField(help_text="Kullanıcının kullanıcı adı.")
    month = serializers.IntegerField(help_text="Raporun ayı.")
    year = serializers.IntegerField(help_text="Raporun yılı.")
    total_work_hours = serializers.FloatField(
        help_text="Ay boyunca toplam çalışma saatleri."
    )
