from lib.db import db
from lib.ddb import Ddb

class MessageGroups:
  def run(cognito_user_id):
    model = {
      'errors': None,
      'data': None
    }

    print("msg grp",
    cognito_user_id, flush=True)

    sql = db.template('users','uuid_from_cognito_user_id')
    my_user_uuid = db.query_value(sql,{'cognito_user_id': cognito_user_id})

    print("UUID",my_user_uuid)


    ddb = Ddb.client()
    data = Ddb.list_message_groups(ddb, my_user_uuid)
    print("list_message_groups:",data)
    model['data'] = data
    return model