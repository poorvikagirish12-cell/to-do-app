import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # ntfy.sh integration fields
    ntfy_topic = models.CharField(max_length=100, blank=True, null=True, unique=True)
    timezone = models.CharField(max_length=50, default='UTC')  # To calculate local time for notifications

    def save(self, *args, **kwargs):
        if not self.ntfy_topic:
            self.ntfy_topic = f"todo_user_{uuid.uuid4().hex}"
        super().save(*args, **kwargs)
