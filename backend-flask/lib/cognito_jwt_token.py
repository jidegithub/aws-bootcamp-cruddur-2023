import os
import urllib.request, json
import requests

class FlaskAWSCognitoError(Exception):
  pass

class TokenVerifyError(Exception):
  pass

def verify_token():
    verification_endpoint = os.environ.get("NODE_URL")
    print("endpoint", flush=True)
    print(verification_endpoint, flush=True)
    try:
        response = urllib.request.urlopen(verification_endpoint)
        data = response.read()
        dict = json.loads(data)
        print("data", data, flush=True)
        print("dict", dict, flush=True)
        return dict
    except requests.exceptions.RequestException as e:
            raise FlaskAWSCognitoError(str(e)) from e