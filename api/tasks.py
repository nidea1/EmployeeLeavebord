from celery import shared_task
from django.core.mail import send_mail
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from api.constants import create_notification, NOTIFICATION_TYPE_WARNING, NOTIFICATION_TYPE_INFO
from api.utils import send_notification


@shared_task
def send_low_leave_notification_task(user_id):
    from .models import User

    try:
        user = User.objects.get(id=user_id)
        admin = User.objects.get(username="admin")
        send_mail(
            "Düşük Yıllık İzin Uyarısı",
            f"Çalışan {user.username}'ın kalan yıllık izin günleri {user.annual_leave_days} gün kaldı.",
            "system@company.com",
            [admin.email],
        )

        notification = create_notification(
            message=f"Çalışan {user.username} düşük izin günlerine ulaştı.",
            notif_type=NOTIFICATION_TYPE_WARNING,
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{admin.id}",
            {
                "type": "send_notification",
                "message": notification,
            },
        )
    except User.DoesNotExist:
        print("Kullanıcı veya admin bulunamadı.")
    except Exception as e:
        print(f"Email notification failed: {e}")


@shared_task
def send_late_arrival_notification_task(user_id, late_minutes):
    from .models import User

    try:
        user = User.objects.get(id=user_id)
        admin_emails = User.objects.filter(is_superuser=True).values_list(
            "email", flat=True
        )
        if late_minutes > 60:
            hours = late_minutes // 60
            minutes = late_minutes % 60
            late_message = (
                f"{user.username} bugün işe {hours} saat {minutes} dakika geç kaldı."
            )
        else:
            late_message = f"{user.username} bugün işe {late_minutes} dakika geç kaldı."

        send_mail(
            "Gecikme Uyarısı",
            late_message,
            "system@company.com",
            list(admin_emails),
            fail_silently=False,
        )

        notification = create_notification(
            message=late_message, notif_type=NOTIFICATION_TYPE_WARNING
        )
        channel_layer = get_channel_layer()
        for admin in User.objects.filter(is_superuser=True):
            async_to_sync(channel_layer.group_send)(
                f"user_{admin.id}",
                {
                    "type": "send_notification",
                    "message": notification,
                },
            )
    except User.DoesNotExist:
        print("Kullanıcı bulunamadı.")
    except Exception as e:
        print(f"Email notification failed: {e}")


@shared_task
def test_notification(user_id):
    send_notification(
        user_id=user_id,
        message="Bu bir test bildirimidir.",
        notif_type=NOTIFICATION_TYPE_INFO
    )