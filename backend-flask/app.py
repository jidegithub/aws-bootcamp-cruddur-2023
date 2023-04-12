import os
from flask import Flask
from flask import request
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
from services.tracing.honeycomb import init_honeycomb

# RollBar Service
from services.rollbar import init_rollbar, rollbar
# AWS token verifier
from middleware.cognito_jwt_token_middleware import CognitoJwtTokenMiddleware

# CLOUDWATCH Logs
from services.logging.logger import setup_logger
setup_logger()
logger = logging.getLogger("cruddur-backend-flask")

app = Flask(__name__)

# HoneyComb
# Initialize automatic instrumentation with Flask
init_honeycomb(app)

frontend = os.getenv('FRONTEND_URL')
backend = os.getenv('BACKEND_URL')

origins = [frontend, backend]
cors = CORS(
  app, 
  resources={r"/api/*": {"origins": origins}},
  headers=['Content-Type', 'Authorization'], 
  expose_headers='Authorization',
  methods="OPTIONS,GET,HEAD,POST"
)

# RollBar init
if os.getenv("ENABLE_ROLLBAR_LOG") and os.getenv("ENABLE_ROLLBAR_LOG").lower() == "true":
  init_rollbar(app)

@app.route('/rollbar/test')
def rollbar_test():
    rollbar.report_message('Hello World!', 'warning')
    return "Hello World!"

@app.route("/api/message_groups", methods=['GET'])
@CognitoJwtTokenMiddleware
def data_message_groups(cognito_user_id):
  logger.info("message group request is received")
  logger.info(cognito_user_id)
  try:
    model = MessageGroups.run(cognito_user_id=cognito_user_id)
    if model['errors'] is not None:
      return model['errors'], 422
    else:
      return model['data'], 200
  except Exception as e:
    app.logger.debug(e)
    return {}, 401

@app.route("/api/messages/<string:message_group_uuid>", methods=['GET'])
@CognitoJwtTokenMiddleware
def data_messages(cognito_user_id, message_group_uuid):
  user_sender_handle = 'grahams'
  user_receiver_handle = request.args.get('user_reciever_handle')
  # message_group_uuid   = request.json.get('message_group_uuid',None)
  try:
    model = Messages.run(
      message_group_uuid=message_group_uuid,
      cognito_user_id=cognito_user_id
    )
    if model['errors'] is not None:
      return model['errors'], 422
    else:
      return model['data'], 200
  except Exception as e:
    app.logger.debug(e)
    return {}, 401

@app.route("/api/messages", methods=['POST','OPTIONS'])
@cross_origin()
@CognitoJwtTokenMiddleware
def data_create_message(cognito_user_id):
  try:
    message = request.json['message']

    print("Request", dict(request.json), flush=True)

    message_group_uuid   = request.json.get('message_group_uuid',None)
    user_receiver_handle = request.json.get('user_receiver_handle',None)
    
    # print("msg grp uuid", message_group_uuid, flush=True)
    # print("user receiver hndl", user_receiver_handle, flush=True)

    if message_group_uuid == None:
      # Create for the first time
      model = CreateMessage.run(
        mode="create",
        message=message,
        cognito_user_id=cognito_user_id,
        user_receiver_handle=user_receiver_handle
      )
    else:
      # Push onto existing Message Group
      model = CreateMessage.run(
        mode="update",
        message=message,
        message_group_uuid=message_group_uuid,
        cognito_user_id=cognito_user_id
      )

    if model['errors'] is not None:
      return model['errors'], 422
    else:
      return model['data'], 200
  except Exception as e:
    # unauthenticated request
    app.logger.debug(e)
    app.logger.debug("unauthenticated")
    return {}, 401

@app.route("/api/activities/home", methods=['GET'])
@CognitoJwtTokenMiddleware
def data_home(cognito_user_id):
  app.logger.info("request header from app")
  data = HomeActivities.run(cognito_user_id)
  return data, 200

@app.route("/api/activities/notifications", methods=['GET'])
def data_notifications():
  data = NotificationsActivities.run()
  return data, 200

@app.route("/api/users/@<string:handle>/short", methods=['GET'])
def data_users_short(handle):
  data = UsersShort.run(handle)
  return data, 200

@app.route("/api/activities/@<string:handle>", methods=['GET'])
def data_handle(handle):
  model = UserActivities.run(handle)
  if model['errors'] is not None:
    return model['errors'], 422
  else:
    return model['data'], 200

@app.route("/api/activities/search", methods=['GET'])
def data_search():
  term = request.args.get('term')
  model = SearchActivities.run(term)
  if model['errors'] is not None:
    return model['errors'], 422
  else:
    return model['data'], 200

@app.route("/api/activities", methods=['POST','OPTIONS'])
@cross_origin()
def data_activities():
  user_handle  = 'grahams'
  message = request.json['message']
  ttl = request.json['ttl']
  model = CreateActivity.run(message, user_handle, ttl)
  if model['errors'] is not None:
    return model['errors'], 422
  else:
    return model['data'], 200

@app.route("/api/activities/<string:activity_uuid>", methods=['GET'])
def data_show_activity(activity_uuid):
  data = ShowActivities.run(activity_uuid=activity_uuid)
  return data, 200

@app.route("/api/activities/<string:activity_uuid>/reply", methods=['POST','OPTIONS'])
@cross_origin()
def data_activities_reply(activity_uuid):
  user_handle  = 'grahams'
  # user_handle  = 'reef'
  message = request.json['message']
  model = CreateReply.run(message, user_handle, activity_uuid)
  if model['errors'] is not None:
    return model['errors'], 422
  else:
    return model['data'], 200

@app.route("/api/health-check", methods=["GET"])
def health_check():
  logger.info("health request received")
  data = {"success": True, "message": "healthy"}
  return data, 200

# @app.after_request
# def after_request(response):
#   timestamp = strftime('[%Y-%b-%d %H:%M]')
#   logger.info('%s %s %s %s %s %s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, response.status)
#   return response

if __name__ == "__main__":
  app.run(debug=True)


