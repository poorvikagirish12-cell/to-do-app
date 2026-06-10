from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAuthenticationTests(TestCase):
    def test_user_creation_generates_ntfy_topic(self):
        user = User.objects.create_user(username='testuser', password='password123')
        self.assertIsNotNone(user.ntfy_topic)
        self.assertTrue(user.ntfy_topic.startswith('todo_'))
        self.assertEqual(user.timezone, 'UTC')
