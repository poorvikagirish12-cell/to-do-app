from django.db import models
from django.conf import settings
from django.utils import timezone

class List(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lists')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex code for 3D UI styling
    icon = models.CharField(max_length=50, default='folder')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.user.username}'s {self.name}"

class Task(models.Model):
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('DONE', 'Done'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    list = models.ForeignKey(List, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='TODO')
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Scheduling logs to prevent duplicate reminder triggers
    reminder_sent_day_before = models.BooleanField(default=False)
    reminder_sent_due_day = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def mark_completed(self):
        self.status = 'DONE'
        self.completed_at = timezone.now()
        self.save()

    def __str__(self):
        return self.title

def default_frequency():
    return []

class Habit(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habits')
    list = models.ForeignKey(List, on_delete=models.SET_NULL, null=True, blank=True, related_name='habits')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # List of weekday integers [0=Monday, ..., 6=Sunday] stored as a list/JSON
    frequency = models.JSONField(default=default_frequency) 
    
    start_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    # Tracking logs to prevent duplicate daily reminder triggers
    last_reminder_sent_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class HabitLog(models.Model):
    STATUS_CHOICES = [
        ('DONE', 'Completed'),
        ('MISSED', 'Missed'),
    ]
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='MISSED')
    logged_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('habit', 'date')

    def __str__(self):
        return f"{self.habit.title} - {self.date} - {self.status}"

class DailyPerformanceSnapshot(models.Model):
    """
    Caches historical summary metrics for performance graphs,
    avoiding slow database joins on large histories.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='performance_snapshots')
    date = models.DateField()
    tasks_completed = models.IntegerField(default=0)
    tasks_failed = models.IntegerField(default=0)  # Overdue tasks
    habits_completed = models.IntegerField(default=0)
    habits_failed = models.IntegerField(default=0)
    completion_rate = models.FloatField(default=0.0) # percentage of items finished

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.completion_rate}%"
