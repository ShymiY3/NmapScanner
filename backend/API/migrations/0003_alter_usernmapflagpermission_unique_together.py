# Generated by Django 5.0.6 on 2024-05-26 13:35

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0002_nmap_flags'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='usernmapflagpermission',
            unique_together={('user', 'flag')},
        ),
    ]
