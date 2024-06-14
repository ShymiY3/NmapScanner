import uuid
from django.db import models
from User.models import CustomUser  

class Scan(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('SUCCESS', 'Success'),
        ('FAILURE', 'Failure'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    target = models.CharField(max_length=100)
    flags = models.TextField(blank=True, null=True, default="")
    with_sudo = models.BooleanField(default=False)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING')
    result_xml = models.TextField(blank=True, null=True)
    result_html = models.TextField(blank=True, null=True, help_text="HTML string of result")
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)
    error = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Scan by {self.owner.username} on {self.start_date}"
    
class ScanTag(models.Model):
    tag = models.CharField(max_length=50)
    scan_result = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name='tags')
    
    def __str__(self):
        return f"Tag: {self.tag} for scan {self.scan_result.id}"
    
class NmapFlag(models.Model):
    flag = models.CharField(max_length=30, unique=True)
    description = models.CharField(max_length=200, blank=True, null=True)
    
    def __str__(self):
        return f'Flag: {self.flag}'
    

class UserNmapFlagPermission(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    flag = models.ForeignKey(NmapFlag, on_delete=models.CASCADE)
    is_allowed = models.BooleanField(default=False)
     
    def __str__(self):
        return f'Permission for {self.user.username} on {self.flag}'