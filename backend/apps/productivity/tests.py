from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Task
from .utils import update_daily_snapshot

User = get_user_model()

class ProductivityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='produser', password='password123')

    def test_task_completion_updates_snapshot(self):
        # Create a task due today
        today = timezone.now().date()
        task = Task.objects.create(
            user=self.user,
            title='Test task',
            due_date=today,
            status='TODO'
        )
        
        # Verify initial snapshot calculation
        snapshot = update_daily_snapshot(self.user, today)
        self.assertEqual(snapshot.tasks_completed, 0)
        self.assertEqual(snapshot.tasks_failed, 1)  # Due today, currently TODO
        self.assertEqual(snapshot.completion_rate, 0.0)

        # Complete task
        task.mark_completed()
        
        # Re-verify snapshot calculation
        snapshot = update_daily_snapshot(self.user, today)
        self.assertEqual(snapshot.tasks_completed, 1)
        self.assertEqual(snapshot.tasks_failed, 0)
        self.assertEqual(snapshot.completion_rate, 100.0)
