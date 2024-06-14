from django.contrib import admin
from . import models

# Register your models here.
admin.site.register(models.Scan)
admin.site.register(models.NmapFlag)
admin.site.register(models.UserNmapFlagPermission)