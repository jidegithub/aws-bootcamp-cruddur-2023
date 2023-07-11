import os
from flask import Flask
from flask import request, g
from flask_cors import CORS, cross_origin
from time import strftime
import logging

from services.home_activities import *
from services.notifications_activities import *
from services.user_activities import *
from services.create_activity import *
from services.create_reply import *
from services.search_activities import *
from services.message_groups import *
from services.messages import *
from services.create_message import *
from services.show_activity import *
from services.users_short import *
from services.update_profile import *
from services.tracing.honeycomb import init_honeycomb
from lib.helpers import model_json
from lib.cors import init_cors

# RollBar Service
from services.logging.rollbar import init_rollbar, rollbar
# AWS token verifier
from middleware.cognito_jwt_token_middleware import jwt_required

# CLOUDWATCH Logs
from services.logging.logger import setup_logger
setup_logger()
logger = logging.getLogger("cruddur")

# load routes -----------
import routes.general
import routes.activities
import routes.users
import routes.messages

app = Flask(__name__)

# HoneyComb
# Initialize automatic instrumentation with Flask
init_honeycomb(app)

init_cors(app)

# RollBar init
if os.getenv("ENABLE_ROLLBAR_LOG") and os.getenv("ENABLE_ROLLBAR_LOG").lower() == "true":
  with app.app_context():
    g.rollbar = init_rollbar(app)

@app.route('/rollbar/test')
def rollbar_test():
    g.rollbar.report_message('Hello World!', 'warning')
    return "Hello World!"

# load routes -----------
routes.general.load(app)
routes.activities.load(app)
routes.users.load(app)
routes.messages.load(app)

# @app.after_request
# def after_request(response):
#   timestamp = strftime('[%Y-%b-%d %H:%M]')
#   logger.info('%s %s %s %s %s %s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, response.status)
#   return response

if __name__ == "__main__":
  app.run(debug=True)


