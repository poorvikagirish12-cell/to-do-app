import pytz
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from apps.authentication.models import User
from apps.productivity.models import Task, Habit
from .services import send_ntfy_notification

@shared_task
def send_scheduled_reminders():
    now_utc = timezone.now()
    # Fetch users with notification topic configured
    users = User.objects.exclude(ntfy_topic__isnull=True).exclude(ntfy_topic='')
    
    for user in users:
        # Convert to local time
        try:
            user_tz = pytz.timezone(user.timezone)
        except Exception:
            user_tz = pytz.utc
            
        local_time = now_utc.astimezone(user_tz)
        local_today = local_time.date()
        
        # Limit alerts to standard hours (e.g. only run checks at local 9 AM)
        if local_time.hour != 9:
            continue
            
        # --- Task Reminders ---
        # 1 day before
        day_before_tasks = Task.objects.filter(
            user=user, 
            status='TODO', 
            due_date=local_today + timedelta(days=1),
            reminder_sent_day_before=False
        )
        for task in day_before_tasks:
            success = send_ntfy_notification(
                topic=user.ntfy_topic,
                title="Upcoming Task",
                message=f"Reminder: '{task.title}' is due tomorrow.",
                priority="default"
            )
            if success:
                task.reminder_sent_day_before = True
                task.save()
            
        # Due day
        due_day_tasks = Task.objects.filter(
            user=user, 
            status='TODO', 
            due_date=local_today,
            reminder_sent_due_day=False
        )
        for task in due_day_tasks:
            success = send_ntfy_notification(
                topic=user.ntfy_topic,
                title="Task Due Today",
                message=f"Action required! '{task.title}' is due today!",
                priority="high"
            )
            if success:
                task.reminder_sent_due_day = True
                task.save()

        # --- Habit Reminders ---
        weekday_idx = local_today.weekday()  # 0 = Monday, 6 = Sunday
        active_habits = Habit.objects.filter(
            user=user,
            is_active=True
        ).exclude(last_reminder_sent_date=local_today)
        
        for habit in active_habits:
            # Ensure weekday_idx is in habit.frequency list
            if isinstance(habit.frequency, list) and weekday_idx in habit.frequency:
                success = send_ntfy_notification(
                    topic=user.ntfy_topic,
                    title="Habit Check-in",
                    message=f"Habit Check-in: Remember to '{habit.title}' today!",
                    priority="default"
                )
                if success:
                    habit.last_reminder_sent_date = local_today
                    habit.save()
