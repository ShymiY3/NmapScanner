# Generated by Django 5.0.6 on 2024-05-27 17:50

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('User', '0002_customuser_allow_sudo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]
