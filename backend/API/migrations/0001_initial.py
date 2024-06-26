# Generated by Django 5.0.6 on 2024-05-25 20:08

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='NmapFlag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('flag', models.CharField(max_length=30, unique=True)),
                ('description', models.CharField(blank=True, max_length=200, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Scan',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('target', models.CharField(max_length=100)),
                ('flags', models.TextField(blank=True, default='', null=True)),
                ('with_sudo', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('IN_PROGRESS', 'In Progress'), ('SUCCESS', 'Success'), ('FAILURE', 'Failure')], default='PENDING', max_length=30)),
                ('result_xml', models.TextField(blank=True, null=True)),
                ('result_html', models.TextField(blank=True, null=True)),
                ('start_date', models.DateTimeField(auto_now_add=True)),
                ('note', models.TextField(blank=True, null=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ScanTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag', models.CharField(max_length=50)),
                ('scan_result', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to='API.scan')),
            ],
        ),
        migrations.CreateModel(
            name='UserNmapFlagPermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_allowed', models.BooleanField(default=False)),
                ('flag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='API.nmapflag')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
