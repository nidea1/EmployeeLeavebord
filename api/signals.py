from django.db.models.signals import pre_save
from django.dispatch import receiver
from .tasks import send_low_leave_notification_task

from .models import User

@receiver(pre_save, sender=User)
def notify_admin_low_leave(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        previous = User.objects.get(pk=instance.pk)
    except User.DoesNotExist:
        return

    if instance.annual_leave_days < 3 and previous.annual_leave_days >= 3:
        if not instance.low_leave_notified:
            send_low_leave_notification_task.delay(instance.id)
            instance.low_leave_notified = True

    elif instance.annual_leave_days >= 3 and previous.annual_leave_days < 3:
        instance.low_leave_notified = False