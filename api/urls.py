from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import *


router = DefaultRouter()
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-requests')
router.register(r'employees', EmployeeViewSet, basename='employees')
router.register(r'attendances', AttendanceViewSet, basename='attendances')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('user/', ObtainUserView.as_view(), name='user'),
    path('check-in/', CheckInView.as_view(), name='check-in'),
    path('check-out/', CheckOutView.as_view(), name='check-out'),
    path('', include(router.urls)),
    path('late-arrivals/', LateArrivalsView.as_view(), name='late-arrivals'),
    path('pending-leaves/', PendingLeavesView.as_view(), name='pending-leaves'),
    path('monthly-work-report/', MonthlyWorkReportView.as_view(), name='monthly-work-report'),
]