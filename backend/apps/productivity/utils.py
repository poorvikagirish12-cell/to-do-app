from django.db.models import Q
from .models import Task, HabitLog, DailyPerformanceSnapshot

def update_daily_snapshot(user, date):
    """
    Recalculates completed and failed tasks/habits for a user on a given date,
    then updates or creates the DailyPerformanceSnapshot.
    """
    # 1. Count tasks completed on this date
    tasks_completed = Task.objects.filter(
        user=user,
        status='DONE',
        completed_at__date=date
    ).count()

    # 2. Count tasks failed (overdue tasks - status TODO and due_date <= date)
    tasks_failed = Task.objects.filter(
        user=user,
        status='TODO',
        due_date__lte=date
    ).count()

    # 3. Count habits completed on this date
    habits_completed = HabitLog.objects.filter(
        habit__user=user,
        date=date,
        status='DONE'
    ).count()

    # 4. Count habits missed on this date
    habits_failed = HabitLog.objects.filter(
        habit__user=user,
        date=date,
        status='MISSED'
    ).count()

    # 5. Calculate completion rate
    total_items = tasks_completed + tasks_failed + habits_completed + habits_failed
    completion_rate = 0.0
    if total_items > 0:
        completion_rate = round(((tasks_completed + habits_completed) / total_items) * 100.0, 2)

    snapshot, created = DailyPerformanceSnapshot.objects.update_or_create(
        user=user,
        date=date,
        defaults={
            'tasks_completed': tasks_completed,
            'tasks_failed': tasks_failed,
            'habits_completed': habits_completed,
            'habits_failed': habits_failed,
            'completion_rate': completion_rate
        }
    )
    return snapshot
