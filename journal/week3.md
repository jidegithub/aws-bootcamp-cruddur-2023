# Week 3 — Decentralized Authentication

# Setup Cognito User Pool

![Cognito User Pool](../_docs/assets/week3/cognito.png)

# Implement Custom Signin/Signup/Custom/Confirmation Page/Custom Recovery Page

## POC
[![Signin/Signup/Custom/Confirmation Page/Custom Recovery Page](https://img.youtube.com/vi/ncujxRsbOe8/0.jpg)](https://youtu.be/E3YFakvp3RE)

# Homework Challenges 

# Decouple the JWT verify from the application code by writing a Flask Middleware

[python JWT cognito Middleware folder](../backend-flask/services/middleware/cognito_jwt_verifier.py)

# [Hard] Decouple the JWT verify by implementing a Container Sidecar pattern using AWS’s official Aws-jwt-verify.js library

## Architecture 

![JWT auth with envoy](../_docs/assets/week3/jwt-achitecture-diag.png)

### Workflow
1. Client sent a http request with `Authorization: Bear TOKEN` in the  header 
2. Envoy receives the request and send it to jwt-authorizer application 
3. jwt-authorizer application connect to AWS cognito to validate the token 
4. If the token is valid
   1. jwt-authorizer response an http response with code 200
   2. Envoy forward the origin request to the flask app

5. If the token is node valid
   1. jwt-authorizer response an http response with code 403
   2. Envoy send an HTTP response to the client with code 403

## Node application with aws-jwt-verify official library
### `jwt-authorizer`

The application is packaged in a docker container and bind to port 3002
All the requests sent to `"/auth/*"` endpoint will be processed and run a JWT validation process with cognito.

[Application folder](../jwt-authorizer-api/)

[Docker File](../jwt-authorizer-api/Dockerfile)

### `Envoy front proxy`
Envoy front proxy is setup in front of the jwt-authorizer in order to proxy the http request send from the react app. All the requests with the path /api/ are intercepted and validated with the token via jwt-authorizer app. 

[Envoy config file](../envoy/front-envoy.yaml)

[Envoy Dockerfile](../envoy/Dockerfile)

## POC 

[![Cruddur JWT with AWS lib](https://img.youtube.com/vi/Kb0ap_SgJuo/0.jpg)](https://www.youtube.com/watch?v=Kb0ap_SgJuo)


# [Hard] Decouple the JWT verify process by using Envoy as a sidecar https://www.envoyproxy.io/

The authorisation part works fine when using postman but I'am facing a cors issue when connecting via the REACT app, an issue is created in envoy github repo
https://github.com/envoyproxy/envoy/issues/26054

[Envoy Dockerfile](../envoy/Dockerfile)

[Envoy config file](../envoy/envoy-cognito.yaml)

![Envoy postman](../_docs/assets/week3/cognito%20envoy%20Postman.png)

![Envoy log cognito auth](../_docs/assets/week3/envoy%20cognito%20output.png)

#### POC (watch the below video)

[![Decouple the JWT verify process by using Envoy](https://img.youtube.com/vi/vnjpJmxj1d0/0.jpg)](https://www.youtube.com/watch?v=vnjpJmxj1d0)