from django.core.management.base import BaseCommand
from apps.notifications.services import send_ntfy_notification

class Command(BaseCommand):
    help = 'Sends a test notification to ntfy.sh'

    def add_arguments(self, parser):
        parser.add_argument('topic', type=str, help='The ntfy.sh topic name to send to')
        parser.add_argument('--title', type=str, default='Test Notification', help='Title of the notification')
        parser.add_argument('--message', type=str, default='Hello from 3D Productivity App!', help='Message of the notification')
        parser.add_argument('--priority', type=str, default='default', help='Priority: min, low, default, high, urgent')

    def handle(self, *args, **options):
        topic = options['topic']
        title = options['title']
        message = options['message']
        priority = options['priority']

        self.stdout.write(self.style.NOTICE(f"Sending test notification to ntfy.sh topic '{topic}'..."))
        success = send_ntfy_notification(topic, title, message, priority)
        
        if success:
            self.stdout.write(self.style.SUCCESS("Notification sent successfully! Check your device/channel."))
        else:
            self.stdout.write(self.style.ERROR("Failed to send notification. See errors above."))
