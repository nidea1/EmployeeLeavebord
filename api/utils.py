from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .constants import create_notification


def send_notification(user_id, message, notif_type='info'):
    channel_layer = get_channel_layer()
    notification = create_notification(message=message, notif_type=notif_type)
    async_to_sync(channel_layer.group_send)(
        f'user_{user_id}',
        {
            'type': 'send_notification',
            'message': notification,
        }
    )