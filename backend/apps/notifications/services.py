import requests
from django.conf import settings

def send_ntfy_notification(topic, title, message, priority="default"):
    """
    Dispatches a notification to ntfy.sh.
    Priority can be: min, low, default, high, urgent.
    """
    url = f"{settings.NTFY_SERVER_URL.rstrip('/')}/{topic}"
    headers = {
        "Title": title,
        "Priority": priority,
    }
    try:
        response = requests.post(url, data=message.encode('utf-8'), headers=headers, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to send notification: {e}")
        return False
