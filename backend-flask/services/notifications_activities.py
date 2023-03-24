from datetime import datetime, timedelta, timezone
from opentelemetry import trace
import logging

#Xray
from aws_xray_sdk.core import xray_recorder
# Honeycomb
tracer = trace.get_tracer("api.notifications.activities")
#Logging
logger = logging.getLogger("cruddur-backend-flask")


class NotificationsActivities:
  @tracer.start_as_current_span("api.notification.activities.run")
  def run():
    with tracer.start_as_current_span("notifications-activites-inner"):
      span = trace.get_current_span()
      now = datetime.now(timezone.utc).astimezone()
      
      span.set_attribute("app.received.date", f"{now.isoformat()}")
      span.set_attribute("app.now", now.isoformat())

    with xray_recorder.capture("api_notifications_activities_run") as subsegment:
      span = trace.get_current_span()  
      now = datetime.now(timezone.utc).astimezone()

      results = [{
        'uuid': '68f126b0-1ceb-4a33-88be-d90fa7109eee',
        'handle':  'Sheldon Cooper',
        'message': 'Super Asymmetry is fun!',
        'created_at': (now - timedelta(days=2)).isoformat(),
        'expires_at': (now + timedelta(days=5)).isoformat(),
        'likes_count': 5,
        'replies_count': 1,
        'reposts_count': 0,
        'replies': [{
          'uuid': '26e12864-1c26-5c3a-9658-97a10f8fea67',
          'reply_to_activity_uuid': '68f126b0-1ceb-4a33-88be-d90fa7109eee',
          'handle':  'Worf',
          'message': 'This post has no honor!',
          'likes_count': 0,
          'replies_count': 0,
          'reposts_count': 0,
          'created_at': (now - timedelta(days=2)).isoformat()
        }],
      }
      ]

      span.set_attribute("app.result_length", len(results))
      subsegment.put_metadata("app.result_length", len(results))
    logger.debug(f"Notification activities result: {results}")

    return results