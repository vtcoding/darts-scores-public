import os
from django.core.asgi import get_asgi_application

# Set default settings module if not already set in environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'darts_scores_backend.settings')

application = get_asgi_application()
