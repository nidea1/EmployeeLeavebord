import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

from api.middleware import TokenAuthMiddlewareStack
from api.consumers import NotificationConsumer

django_application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_application,
    "websocket": TokenAuthMiddlewareStack(
        URLRouter([
            path('ws/notifications/', NotificationConsumer.as_asgi()),
        ])
    ),
})