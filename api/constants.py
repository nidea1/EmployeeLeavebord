NOTIFICATION_TYPE_INFO = 'info'
NOTIFICATION_TYPE_SUCCESS = 'success'
NOTIFICATION_TYPE_WARNING = 'warning'
NOTIFICATION_TYPE_ERROR = 'error'


def create_notification(message, notif_type=NOTIFICATION_TYPE_INFO):
    return {
        'type': notif_type,
        'message': message,
    }