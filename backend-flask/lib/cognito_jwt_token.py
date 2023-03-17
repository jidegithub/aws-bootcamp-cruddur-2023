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
        response = urllib.request.urlopen(request, timeout=10)
        print(list(response), flush=True)
        return list(response)
    except requests.exceptions.RequestException as e:
            raise FlaskAWSCognitoError(str(e)) from e