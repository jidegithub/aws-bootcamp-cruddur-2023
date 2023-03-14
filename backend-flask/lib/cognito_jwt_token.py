import os
import urllib.request, json
import requests

class FlaskAWSCognitoError(Exception):
  pass

class TokenVerifyError(Exception):
  pass

def verify_token(token):
    verification_endpoint = os.environ.get("NODE_URL")
    _, access_token = token.split()
    try:
        request = urllib.request.Request(verification_endpoint)
        request.add_header('Authorization', access_token)

        response = urllib.request.urlopen(request)
        # with urllib.request.urlopen(response) as f:
        #     pass
        # print(f.status, flush=True)
        # print(f.reason, flush=True)
        # data = response.read()
        # dict = json.loads(data)
        print("data", data, flush=True)
        # print("dict", dict, flush=True)
        return dict(response)
    except requests.exceptions.RequestException as e:
            raise FlaskAWSCognitoError(str(e)) from e