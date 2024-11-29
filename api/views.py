from datetime import datetime, time
from django.utils import timezone
from django.contrib.auth import authenticate
from django.db.models import F, Sum, ExpressionWrapper
from django.db.models.fields import DurationField

from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from api.tasks import send_late_arrival_notification_task
from api.utils import send_notification

from .models import User, Attendance, LeaveRequest
from .serializers import (
    MonthlyWorkReportSerializer,
    UserSerializer,
    AttendanceSerializer,
    LeaveRequestSerializer,
)

from .constants import NOTIFICATION_TYPE_SUCCESS, NOTIFICATION_TYPE_ERROR


class LoginView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Kullanıcıyı doğrula ve kimlik doğrulama belirteci al.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["username", "password"],
            properties={
                "username": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Kullanıcının kullanıcı adı"
                ),
                "password": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Kullanıcının şifresi"
                ),
            },
        ),
        responses={
            200: openapi.Response(
                "Jeton",
                openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"token": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            400: "Kullanıcı adı ve şifre gereklidir.",
            401: "Geçersiz kimlik bilgileri.",
        },
    )
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Kullanıcı adı ve şifre gereklidir."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"error": "Geçersiz kimlik bilgileri."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key}, status=status.HTTP_200_OK)


class ObtainUserView(APIView):

    @swagger_auto_schema(
        operation_description="Kimlik doğrulanmış kullanıcının bilgilerini al.",
        responses={
            200: openapi.Response("Kullanıcı Verisi", UserSerializer()),
            401: "Yetkisiz.",
        },
    )
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class CheckInView(APIView):

    @swagger_auto_schema(
        operation_description="Katılım için check-in yap.",
        responses={
            200: openapi.Response(
                "Başarı",
                openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"message": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            400: openapi.Response(
                "Hata",
                openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"error": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            401: "Yetkisiz.",
        },
    )
    def post(self, request):
        user = request.user
        now = timezone.now()
        today = now.date()

        if today.weekday() >= 5:
            return Response(
                {"error": "Bugün hafta sonu!"}, status=status.HTTP_400_BAD_REQUEST
            )

        company_start_time = datetime.combine(today, time(8, 0, 0))
        company_start_time = timezone.make_aware(company_start_time)
        company_end_time = datetime.combine(today, time(18, 0, 0))
        company_end_time = timezone.make_aware(company_end_time)

        if now > company_end_time:
            _attendance.end_time = now
            _attendance.save()
            return Response(
                {"error": "Çalışma saatleri dışında check-in yapamazsınız!"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if now < company_start_time:
            return Response(
                {"error": "Çalışma saatlerine henüz başlamadınız!"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance_exists = Attendance.objects.filter(user=user, date=today).exists()
        if attendance_exists:
            return Response(
                {"error": "Bugün zaten check-in yaptınız!"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _attendance = Attendance.objects.create(user=user, start_time=now, date=today)

        if now > company_start_time:
            delta = now - company_start_time
            late_minutes = int(delta.total_seconds() / 60)

            work_hours_per_day = 10
            late_days = late_minutes / (work_hours_per_day * 60)

            user.annual_leave_days = max(0, user.annual_leave_days - late_days)
            user.save()

            send_late_arrival_notification_task.delay(user.id, late_minutes)

        return Response({"message": "Check-in başarılı!"}, status=status.HTTP_200_OK)


class CheckOutView(APIView):

    @swagger_auto_schema(
        operation_description="Katılım için check-out yap.",
        responses={
            200: openapi.Response(
                "Başarı",
                openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"message": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            400: openapi.Response(
                "Hata",
                openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"error": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            401: "Yetkisiz.",
        },
    )
    def post(self, request):
        user = request.user
        now = timezone.now()
        today = now.date()

        try:
            attendance = Attendance.objects.get(
                user=user, date=today, end_time__isnull=True
            )

            attendance.end_time = now
            attendance.save()

            return Response(
                {"message": "Check-out başarılı!"}, status=status.HTTP_200_OK
            )
        except Attendance.DoesNotExist:
            return Response(
                {"error": "Bugün check-in yapmadınız!"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    @swagger_auto_schema(
        operation_description="Tüm katılım kayıtlarını listele.",
        responses={
            200: AttendanceSerializer(many=True),
            401: "Yetkisiz.",
        },
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Attendance.objects.all()
        return Attendance.objects.filter(user=user)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    filterset_fields = ["status"]

    @swagger_auto_schema(
        operation_description="Tüm izin taleplerini listele.",
        responses={
            200: LeaveRequestSerializer(many=True),
            401: "Yetkisiz.",
        },
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return LeaveRequest.objects.all()
        return LeaveRequest.objects.filter(user=user)

    @swagger_auto_schema(
        operation_description="Yeni bir izin talebi oluştur.",
        request_body=LeaveRequestSerializer,
        responses={
            201: LeaveRequestSerializer(),
            400: "Hata",
            401: "Yetkisiz.",
        },
    )
    def create(self, request, *args, **kwargs):
        user = (
            User.objects.get(id=request.data["user"])
            if "user" in request.data
            else request.user
        )
        if not user.is_employee:
            raise serializers.ValidationError(
                {"detail": "Sadece çalışanlar izin talebi oluşturabilir."}
            )
        request.data["user"] = user.id
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = serializer.validated_data["user"]
        start_date = serializer.validated_data["start_date"]
        end_date = serializer.validated_data["end_date"]
        total_days = (end_date - start_date).days + 1

        if total_days > user.annual_leave_days:
            raise serializers.ValidationError(
                {"detail": "Yeterli yıllık izin gününüz yok."}
            )

        status_value = serializer.validated_data.get("status", "PENDING")
        serializer.save(user=user, status=status_value)

        if self.request.user.is_staff or self.request.user.is_superuser:
            user.annual_leave_days = max(0, user.annual_leave_days - total_days)
            user.save()

    @swagger_auto_schema(
        operation_description="Bir izin talebini onayla.",
        responses={
            200: "İzin talebi onaylandı.",
            400: "Hata",
            401: "Yetkisiz.",
        },
    )
    @action(detail=True, methods=["POST"], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        leave_request = self.get_object()

        if leave_request.status != "PENDING":
            return Response(
                {"detail": "Bu izin talebi zaten işlendi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_days = (leave_request.end_date - leave_request.start_date).days + 1

        leave_request.status = "APPROVED"
        leave_request.save()

        user = leave_request.user
        user.annual_leave_days = max(0, user.annual_leave_days - total_days)
        user.save()

        send_notification(
            user_id=user.id,
            message=f"İzin talebiniz onaylandı: {leave_request.start_date} - {leave_request.end_date}",
            notif_type=NOTIFICATION_TYPE_SUCCESS,
        )

        return Response({"detail": "İzin talebi onaylandı."}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Bir izin talebini reddet.",
        responses={
            200: "İzin talebi reddedildi.",
            400: "Hata",
            401: "Yetkisiz.",
        },
    )
    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != "PENDING":
            return Response(
                {"detail": "Bu izin talebi zaten işlendi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        leave_request.status = "REJECTED"
        leave_request.save()

        send_notification(
            user_id=leave_request.user.id,
            message=f"İzin talebiniz reddedildi: {leave_request.start_date} - {leave_request.end_date}",
            notif_type="error",
        )

        return Response(
            {"detail": "İzin talebi reddedildi."}, status=status.HTTP_200_OK
        )


class LateArrivalsView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AttendanceSerializer

    @swagger_auto_schema(
        operation_description="Tüm geç gelen kayıtları listele.",
        responses={
            200: AttendanceSerializer(many=True),
            401: "Yetkisiz.",
        },
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        company_start_time = timezone.localtime().replace(hour=8, minute=0, second=0)
        return Attendance.objects.filter(start_time__gt=company_start_time)


class PendingLeavesView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = LeaveRequestSerializer

    @swagger_auto_schema(
        operation_description="Tüm bekleyen izin taleplerini listele.",
        responses={
            200: LeaveRequestSerializer(many=True),
            401: "Yetkisiz.",
        },
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return LeaveRequest.objects.filter(status="PENDING")


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_employee=True)
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_description="Tüm çalışanları listele.",
        responses={
            200: UserSerializer(many=True),
            401: "Yetkisiz.",
        },
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Bir çalışanın bilgilerini güncelle.",
        request_body=UserSerializer,
        responses={
            200: UserSerializer(),
            400: "Hata",
            401: "Yetkisiz.",
        },
    )
    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print(f"Güncelleme başarısız oldu: {e}")
            return Response(
                {"error": "Güncelleme başarısız."}, status=status.HTTP_400_BAD_REQUEST
            )


class MonthlyWorkReportView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_description="Çalışanlar için aylık çalışma raporlarını al.",
        manual_parameters=[
            openapi.Parameter(
                "month",
                openapi.IN_QUERY,
                description="Rapor için ay (1-12)",
                type=openapi.TYPE_INTEGER,
            ),
            openapi.Parameter(
                "year",
                openapi.IN_QUERY,
                description="Rapor için yıl (örneğin, 2024)",
                type=openapi.TYPE_INTEGER,
            ),
        ],
        responses={
            200: MonthlyWorkReportSerializer(many=True),
            400: "Geçersiz İstek",
            401: "Yetkisiz",
        },
    )
    def get(self, request, _format=None):
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        if not month or not year:
            return Response(
                {"error": "Ay ve yıl parametreleri gereklidir."}, status=400
            )

        try:
            month = int(month)
            year = int(year)
            if month < 1 or month > 12:
                raise ValueError
        except ValueError:
            return Response(
                {"error": "Geçersiz ay veya yıl parametreleri."}, status=400
            )

        attendances = Attendance.objects.filter(
            start_time__year=year, start_time__month=month, end_time__isnull=False
        )

        attendances = attendances.annotate(
            work_duration=ExpressionWrapper(
                F("end_time") - F("start_time"), output_field=DurationField()
            )
        )

        report_data = attendances.values("user__id", "user__username").annotate(
            total_duration=Sum("work_duration")
        )

        reports = []
        for entry in report_data:
            total_hours = entry["total_duration"].total_seconds() / 3600
            reports.append(
                {
                    "user_id": entry["user__id"],
                    "username": entry["user__username"],
                    "month": month,
                    "year": year,
                    "total_work_hours": round(total_hours, 2),
                }
            )

        serializer = MonthlyWorkReportSerializer(reports, many=True)
        return Response(serializer.data, status=200)
