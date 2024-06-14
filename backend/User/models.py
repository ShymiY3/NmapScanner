from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    allow_all = models.BooleanField(default=False)
    allow_sudo = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        if self._state.adding:  # Only set default value during creation
            if self.is_superuser or self.is_staff:
                self.allow_all = True
                self.allow_sudo = True
                self.must_change_password = False
        super().save(*args, **kwargs)