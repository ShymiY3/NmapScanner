# Generated by Django 5.0.6 on 2024-05-26 13:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('User', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='allow_sudo',
            field=models.BooleanField(default=False),
        ),
    ]
