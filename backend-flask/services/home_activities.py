from datetime import datetime, timedelta, timezone
from opentelemetry import trace
from lib.db import db
import logging

# aws xray
from aws_xray_sdk.core import xray_recorder
# Honeycomb
tracer = trace.get_tracer("api.home.activities")
# Logging
logger = logging.getLogger("cruddur-backend-flask")


class HomeActivities:
  @tracer.start_as_current_span("api.home.activities.run")
  def run(cognito_user_id=None):
    with tracer.start_as_current_span("home-activites-inner"):
      span = trace.get_current_span()
      span.set_attribute("app.received.date", f"{now.isoformat()}")
      span.set_attribute("app.now", now.isoformat())

      with xray_recorder.capture("api_home_activities_run") as subsegment:
        sql = db.template('activities','home')
        results = db.query_array_json(sql)
        span.set_attribute("app.result_length", len(results))
        subsegment.put_metadata("app.result_length", len(results))
      logger.debug(f"Home activities result: {results}")

    return results
      