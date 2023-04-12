from datetime import datetime, timedelta, timezone
from opentelemetry import trace
from lib.db import db
import logging

#Honeycomb
tracer = trace.get_tracer("api.home.activities")
#Logging
logger = logging.getLogger("cruddur-backend-flask")


class HomeActivities:
  @tracer.start_as_current_span("api.home.activities.run")
  def run(cognito_user_id=None):
    logger.info("Home activities controller")
    with tracer.start_as_current_span("home-activites-inner"):
      span = trace.get_current_span()
      now = datetime.now(timezone.utc).astimezone()
      
      span.set_attribute("app.received.date", f"{now.isoformat()}")
      span.set_attribute("app.now", now.isoformat())

      sql = db.template('activities','home')
      results = db.query_array_json(sql)
      span.set_attribute("app.result_length", len(results))

    return results