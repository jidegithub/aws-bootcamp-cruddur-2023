# Week 6 — Deploying Serverless Containers
This week was delivered together with [Week 7](../journal/week7.md), where I attached screenshots as the proofs of my working application.

- [Preparation](#preparation)
- [ECS Cluster and ECR Repo](#ecs-cluster-and-ecr-repo)
- [Images of Backend and Frontend](#images-of-backend-and-frontend)
- [AWS Roles and Security Groups](#aws-roles-and-security-groups)
- [Application Load Balancer](#application-load-balancer)
- [Domain Configuration](#domain-configuration)
- [Fargate Services and Tasks](#fargate-services-and-tasks)

## Context
For this project, I learnt the concept of Clusters, Namespaces, Services and Tasks. Tasks are basically json files that defines how to build a container. Services are very similar to those defined in a docker compose or kubernetes, they are the image for a microservice within the context of some larger application. Examples of services might include an HTTP server, a database, or any other type of executable program that you wish to run in a distributed environment.Namespaces are isolated processes that have a different set of permissions than the system itself, In AWS cloud context, we use cloudmap. A cluster is a logical grouping of tasks or services. Your tasks and services are run on infrastructure that is registered to a cluster.
## Preparation
In the launched Cloud Developement Environment(CDE) workspace, we created scripts that generate environment variables saved as `backend-flask.env` and `frontend-react-js.env` in the root directory matching backend project folders and frontend respectively. These environmental variables are referenced in docker-compose service definitions. I created a ruby script that generate these variables based on if the USER environmental variable is either "codespace" or "gitpod", being the 2 CDEs I used through the entirety of this project.

```sh
./bin/backend/generate_env
./bin/frontend/generate_env
```

Using AWS Parameter store, we are storing sensitive data and passing sensitive data values to AWS for running backend-flask later:

```sh
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/AWS_ACCESS_KEY_ID" --value $AWS_ACCESS_KEY_ID
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/AWS_SECRET_ACCESS_KEY" --value $AWS_SECRET_ACCESS_KEY
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/CONNECTION_URL" --value $PROD_CONNECTION_URL
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/ROLLBAR_ACCESS_TOKEN" --value $ROLLBAR_ACCESS_TOKEN
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/OTEL_EXPORTER_OTLP_HEADERS" --value "x-honeycomb-team=$HONEYCOMB_API_KEY"
```

## ECS Cluster and ECR Repo

Using AWS CLI, create a CloudWatch log group named `cruddur`, a ECS cluster named `cruddur`, and three ECR repos on AWS:

```sh
aws logs create-log-group --log-group-name cruddur
aws logs put-retention-policy --log-group-name cruddur --retention-in-days 1

aws ecs create-cluster \
 --cluster-name cruddur \
 --service-connect-defaults namespace=cruddur

aws ecr create-repository \
 --repository-name cruddur-python \
 --image-tag-mutability MUTABLE

aws ecr create-repository \
 --repository-name backend-flask \
 --image-tag-mutability MUTABLE

aws ecr create-repository \
 --repository-name frontend-react-js \
 --image-tag-mutability MUTABLE
```
## Images of Backend and Frontend

To avoid a single point of failure and potential rate limiting on dockerhub, Images were pushed to AWS Elastic Container Registry (ECR).

Pull a base image of python, then tag and push it to our ECR repo:

```sh
./bin/ecr/login

docker pull python:3.10-slim-buster
docker tag python:3.10-slim-buster $ECR_PYTHON_URL:3.10-slim-buster
docker push $ECR_PYTHON_URL:3.10-slim-buster
```

For the backend image, create `backend-flask/flask_app/health-check`, and update `backend-flask/app.py` to include route for health check. For development purposes, debug mode is turned on for a running flask app. In production, Flask is secured by not running in debug mode. Now we can build backend image and push it to ECR:

```sh
./bin/backend/build
./bin/ecr/login
./bin/backend/push
```

For the frontend image, For development, we keep it as is. 
For production environment create a separate Dockerfile: `frontend-react-js/Dockerfile.prod` and `frontend-react-js/nginx.conf`.Which is a neccessary Nginx configuration file to run our application since we will be deploying the React app build on Nginx. Now we can build frontend image and push it to ECR:

```sh
cd frontend-react-js
npm run build
cd ../
./bin/frontend/build
./bin/ecr/login
./bin/frontend/push
```
## AWS Roles and Security Groups

AWS is a sucker for service roles and permissions. To enable the running container service to communicate with other services and execute commands on your behalf add AWS policies for `CruddurServiceExecutionRole` and `CruddurServiceExecutionPolicy`.

Based on the above files, create the ExecutionRole and attach policies:

```sh
aws iam create-role \
  --role-name CruddurServiceExecutionRole \
  --assume-role-policy-document file://aws/policies/service-assume-role-execution-policy.json

aws iam put-role-policy \
  --policy-name CruddurServiceExecutionPolicy \
  --role-name CruddurServiceExecutionRole \
  --policy-document file://aws/policies/service-execution-policy.json

aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess \
  --role-name CruddurServiceExecutionRole

aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
  --role-name CruddurServiceExecutionRole
```

Then create the TaskRole `CruddurTaskRole` and attach policies:

```sh
aws iam create-role \
    --role-name CruddurTaskRole \
    --assume-role-policy-document "{
  \"Version\":\"2012-10-17\",
  \"Statement\":[{
    \"Action\":[\"sts:AssumeRole\"],
    \"Effect\":\"Allow\",
    \"Principal\":{
      \"Service\":[\"ecs-tasks.amazonaws.com\"]
    }
  }]
}"

aws iam put-role-policy \
  --policy-name SSMAccessPolicy \
  --role-name CruddurTaskRole \
  --policy-document "{
  \"Version\":\"2012-10-17\",
  \"Statement\":[{
    \"Action\":[
      \"ssmmessages:CreateControlChannel\",
      \"ssmmessages:CreateDataChannel\",
      \"ssmmessages:OpenControlChannel\",
      \"ssmmessages:OpenDataChannel\"
    ],
    \"Effect\":\"Allow\",
    \"Resource\":\"*\"
  }]
}"

aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess \
  --role-name CruddurTaskRole

aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess \
  --role-name CruddurTaskRole
```

Get `DEFAULT_VPC_ID` and `DEFAULT_SUBNET_IDS` in order to create a security group named `crud-srv-sg` that has inbound rules for port 4567 and 3000, and then authorize the security group to expose RDS port 5432.

```sh
export DEFAULT_VPC_ID=$(aws ec2 describe-vpcs \
--filters "Name=isDefault, Values=true" \
--query "Vpcs[0].VpcId" \
--output text)
echo $DEFAULT_VPC_ID

export DEFAULT_SUBNET_IDS=$(aws ec2 describe-subnets  \
 --filters Name=vpc-id,Values=$DEFAULT_VPC_ID \
 --query 'Subnets[*].SubnetId' \
 --output json | jq -r 'join(",")')
echo $DEFAULT_SUBNET_IDS

export CRUD_SERVICE_SG=$(aws ec2 create-security-group \
  --group-name "crud-srv-sg" \
  --description "Security group for Cruddur services on ECS" \
  --vpc-id $DEFAULT_VPC_ID \
  --query "GroupId" --output text)
echo $CRUD_SERVICE_SG

aws ec2 authorize-security-group-ingress \
  --group-id $CRUD_SERVICE_SG \
  --protocol tcp \
  --port 4567 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $CRUD_SERVICE_SG \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $DB_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group $CRUD_SERVICE_SG
```

## Application Load Balancer

Provision and configure Application Load Balancer along with target groups via AWS console:

- Basic configurations: name `cruddur-alb`, Internet-facing, IPv4 address type;
- Network mapping: default VPC, select first three availability zones;
- Security groups: create a new security group named `cruddur-alb-sg`, set inbound rules of HTTP and HTTPS from anywhere, and Custom TCP of 4567 and 3000 from anywhere (set description as TMP1 and TMP2); In addition, edit inbound rules of security group `crud-srv-sg`, instead of anywhere, set port source from `cruddur-alb-sg`, set description of port 4567 as ALBbackend, and port 3000 as ALBfrontend;
- Listeners and routing: HTTP:4567 with a new target group named `cruddur-backend-flask-tg`, select type as IP addresses, set HTTP:4567, set health check as `/api/health-check` with 3 healthy threshold, get its arn to put in `aws/json/service-backend-flask.json`; Add another listener HTTP:3000 with another target group created named `cruddur-frontend-react-js`, don't care about health check, set 3 healthy threshold, get its arn to put in `aws/json/service-frontend-react-js.json`.

## Domain Configuration

I registered a domain name `jidecruddur.site` for this bootcamp via [namecheap](https://namecheap.com/). We can manage the domain using Route53 via hosted zone, create an SSL certificate via ACM, setup a record set for naked domain to point to frontend-react-js, and setup a record set for api subdomain to point to the backend-flask:

- At Route 53 > Hosted zones, create a new one with the registered domain name and the public type; Copy the values presented in the NS record type, and paste them into the porkbun nameservers (changes to your authoritative nameservers may take up to a couple of hours to propagate worldwide).
- At Certificate Manger, request a public certificate, add domain names of `jidecruddur.site` and `*.jidecruddur.site`, then enter the created certificate and click "Create records in Route 53", finally Route 53 will show two CNAME records.
- At Load Balancers, add a listener to make HTTP:80 redirect to HTTPS:443, and another one to make HTTPS:443 forward to frontend with certificate we created; edit rules for HTTPS:443 to add a new IF which sets Host Header as `api.jidecruddur.site` and sets THEN forward to `cruddur-backend-flask-tg`.
- At Route 53 > Hosted zones > jidecruddur.site, create a record without a record name, set type as "A - Route Traffic to an IPv4 address and some AWS resources", set route traffic as "Alias to Application and Classic Load Balancer" with the right region and load balancer, set routing policy as simple routing; do it again with record name `api.jidecruddur.site`.

## Fargate Services and Tasks

In [this commit](https://github.com/beiciliang/aws-bootcamp-cruddur-2023/commit/fda56cd91f4ff490ce8052b9c0440e6b6afb886d), add AWS task definitions for backend and frontend. Now we have everything required for tasks, and then register the tasks by:

```sh
./bin/backend/register
./bin/frontend/register
```

## Deploy Backend Flask app as a service to Fargate

Backend service created using this [terraform](../terraform/stacks/ecs/backend_flask.tf) module


### Backend service
![](../_docs/assets/week6-7/aws-backend-service.png)

### Backend service task
![](../_docs/assets/week6-7/aws-backend-service-task.png)

### Backend service task definition
![](../_docs/assets/week6-7/aws-backend-task-def.png)


## Deploy Frontend React JS app as a service to Fargate	

Frontend service created using this [terraform](../terraform/stacks/ecs/frontend.tf) module

### Frontend service
![](../_docs/assets/week6-7/aws-frontend-service.png)

### Frontend service task
![](../_docs/assets/week6-7/aws-frontend-task.png)

### Frontend service task definition
![](../_docs/assets/week6-7/aws-frontend-task-def.png)

## Provision and configure Application Load Balancer along with target groups	

### ALB configuration 

The Application Load balancer created using this terraform ([Click here](../terraform/stacks/ecs/alb.tf)) module

Two rules are configured in the ALB with Two target group along with target group 

1. All traffic match /api/* with api.cruddur.zk15.xyz will be forwarded to backend ALB
2. Any traffic doesn't match the first rule will be forwarded to frontend target group 

### ALB 
![](../_docs/assets/week6-7/aws-alb-overview.png)

### ALB listener 

![](../_docs/assets/week6-7/aws-alb-listener.png)

### ALB Rules

![](../_docs/assets/week6-7/aws-alb-rules.png)

### Backend  Target group

![](../_docs/assets/week6-7/aws-backend-targte-group.png)

### Frontend  Target group

![](../_docs/assets/week6-7/aws-frontend-target-group.png)


## Manage your domain useing Route53 via hosted zone

Route53 records are created using this terraform ([Click here](../terraform/stacks/route53/cruddur.zk15.xyz.tf)) module

### Route53 zone 

In addition to the validation records and the NS one, two A record are created 

1. Alias cruddur.zk15.xyz pointing to the ALB
2. Alias api.cruddur.zk15.xyz pointing to the ALB

![](../_docs/assets/week6-7/aws-r53-zone.png)

The root DNS is managed by [porkbun](https://porkbun.com/account/domainsSpeedy), in order to have the subdomain cruddur.zk15.xyz managed by AWS, I have created an NS record in porkburn to point to AWS NS server managing this zone 

![](../_docs/assets/week6-7/pornkub-dns.png)

```bash
❯ nslookup cruddur.zk15.xyz
Server:		192.168.1.1
Address:	192.168.1.1#53

Non-authoritative answer:
Name:	cruddur.zk15.xyz
Address: 52.214.52.126
Name:	cruddur.zk15.xyz
Address: 34.254.140.116
Name:	cruddur.zk15.xyz
Address: 99.80.132.12
```
```bash
❯ nslookup  api.cruddur.zk15.xyz
Server:		192.168.1.1
Address:	192.168.1.1#53

Non-authoritative answer:
Name:	api.cruddur.zk15.xyz
Address: 99.80.132.12
Name:	api.cruddur.zk15.xyz
Address: 52.214.52.126
Name:	api.cruddur.zk15.xyz
Address: 34.254.140.116
```
## Create an SSL cerificate via ACM

Route53 records are created using this terraform ([Click here](../terraform/stacks/ecs/certificate.tf)) module

![](../_docs/assets/week6-7/aws-acm.png)

## Setup a record set for naked domain to point to frontend-react-js	

![](../_docs/assets/week6-7/aws-naked-domain.png)

## Setup a record set for api subdomain to point to the backend-flask	

![](../_docs/assets/week6-7/aws-r53-subdomain.png)

## Configure CORS to only permit traffic from our domain

### app.py

```python
cors = CORS(
    app,
    resources={r"/api/*": {"origins": origins}},
    expose_headers="Authorization",
    allow_headers=allow_headers,
    methods="OPTIONS,GET,HEAD,POST",
)
```
### Environment variable 

[backend](../terraform/stacks/ecs/backend_flask.tf#L74)
[frontend](../terraform/stacks/ecs/backend_flask.tf#L77)


## Secure Flask by not running in debug mode

The backend application is running behind gunicron. 
[frontend](../backend-flask/config/gunicorn.conf.py

## Implement Refresh Token for Amazon Cognito

[Check Auth ](../frontend-react-js/src/lib/CheckAuth.js)

![](../_docs/assets/week6-7/token-refresh.png)


## Refactor bin directory to be top level and fix message issue

[bin](../bin/)

```bash
❯ bin/ddb  setup
❯ source bin/db.sh
❯ setup
```

### Build/Connect/deploy/push 

All this process is automated with github action. The build is by a github action from the root directory

[ECR GithubAction ](../.github/workflows/ecr_deploy.yaml)
The script [Frontend Build](../build.sh) is used in the github action file to build the frontend image


[ddb script already refactored](../backend-flask/bin/ddb)

```bash
/ddb --help
usage: Cruddur [-h] {schema_load,scan,seed,delete,setup,conversations,conversation,cognito} ...

positional arguments:
  {schema_load,scan,seed,delete,setup,conversations,conversation,cognito}
    schema_load         Load schema
    scan                scan cruddur-messages table
    seed                Push mock data to cruddur-messages table
    delete              delete cruddur-messages table
    setup               Load_schema/seed
    conversations       list all conversations
    conversation        List handler conversation
    cognito             set cognito user ID

options:
  -h, --help            show this help message and exit
```

### Cruddur in production 

![](../_docs/assets/week6-7/cruddur-porduction.png)


## Configure task definitions to contain x-ray and turn on Container Insights	

### Container Insights enabled in the terraform module 

[ecs cluster ](../terraform/stacks/ecs/ecs.tf#L4)

### Xray task definition

[ecs cluster ](../terraform/stacks/ecs/backend_flask.tf#L106-L116)

### Xray in the AWS UI

![](../_docs/assets/week6-7/xray-service-map.png)

![](../_docs/assets/week6-7/xray-trace.png)


## Change Docker Compose to explicitly use a user-defined network

[docker dev](../docker-compose-dev.yml#L169)

```bash
networks: 
  cruddur-network:
    driver: bridge
    name: cruddur
```


## Create Dockerfile specfically for production use case
[backend](../backend-flask/Dockerfile.prod)
[frontend](../frontend-react-js/Dockerfile.prod)


## Using ruby generate out env dot files for docker using erb templates

## POC (Cruddur in production)

[![ Cruddur in production](https://img.youtube.com/vi/vnjpJmxj1d0/0.jpg)](https://www.youtube.com/watch?v=vnjpJmxj1d0)










In [this commit](https://github.com/beiciliang/aws-bootcamp-cruddur-2023/commit/443e8378859b26ebeeb39f6dda5e6263293897d2), add basic json for creating AWS services. After creating the application load balancer, corresponding security group, subnet and target group, update the json in [this commit](https://github.com/beiciliang/aws-bootcamp-cruddur-2023/commit/5da2a8e128f3549e4b369b80a9c84f6c6d85b832), [this commit](https://github.com/beiciliang/aws-bootcamp-cruddur-2023/commit/0df589322b7b3cafe482df89c06e35e72186950e), and [this commit](https://github.com/beiciliang/aws-bootcamp-cruddur-2023/commit/9b3d6ce6533086114eb8084a9ec2a8c8613cd237). Then create the service by:

```sh
aws ecs create-service --cli-input-json file://aws/json/service-backend-flask.json
aws ecs create-service --cli-input-json file://aws/json/service-frontend-react-js.json
```

Before checking the domain https://beici-demo.xyz/ to see if the application works, we can check the backend https://api.beici-demo.xyz/api/health-check that should return a success, and https://api.beici-demo.xyz/api/activities/home that should be able to retrieve data from RDS.

Since I am the only user signed up in the app, it's impossible to send messages to others. To do this, I can insert a mock user to RDS using the commands below, then I can send messages using https://beici-demo.xyz/messages/new/londo:

```sh
./bin/db/connect prod
\x on
select * from users;
INSERT INTO public.users (display_name, email, handle, cognito_user_id)
VALUES
  ('Londo Mollari','lmollari@centari.com' ,'londo' ,'MOCK');
select * from users;
\q
```

Now we can check our domain https://beici-demo.xyz/ to see if everything works. If it is, we can safely remove TMP1 and TMP2 inbound rules in the security group `cruddur-alb-sg`, and delete HTTP:4567 and HTTP:3000 listeners in load balancer `cruddur-alb` (they were there for debugging more easily). Now we can only access the application through the domain.

If changes are made for backend/frontend, use the scripts in `./bin/backend/` and `./bin/frontend/` to build, tag, push the image to ECR, and update the service with a force deployment.

You may see "503 Service Temporarily Unavailable" on my domain. This is because I've updated the Fargate services which set the task to 0 in order to save my AWS budget.
