# Week 4 — Postgres and RDS

# Create RDS Postgres Instance

## Using AWS CLI

![Cruddur RDS](../_docs/assets/week4/rds_creation-cli.png)

# Bash scripting for common database actions

Bash script performing different action on Postgres DB was created [db script](../backend-flask/bin/db)

## connect

Prod
![Connect PROD](../_docs/assets/week4/postgres-connect-prod.png)

Local
![Connect Local](../_docs/assets/week4/postgres-connect-local.png)

## create

![create db](../_docs/assets/week4/postgres-create.png)

## drop

Local
![drop db](../_docs/assets/week4/postgres-drop.png)

## load_schema

Local
![load db local](../_docs/assets/week4/postgres-load-schema-local.png)

## seed

![seed db local](../_docs/assets/week4/postgres-seed-data.png)

## sessions

![seed db local](../_docs/assets/week4/postgres-sessions.png)

## setup

![seed db local](../_docs/assets/week4/postgres-setup-local.png)

# Install Postgres Driver in Backend Application

[db driver](../backend-flask/lib/db.py)

![gitpod db log](../_docs/assets/week4/postgres-db-log.png)

# Connect Gitpod to RDS Instance

## How it works:

[Update RDS Security Group Script](../backend-flask/bin/rds/update-sg-rule) <br />
Since a Cloud Developement Environment(CDE) like gitpod is ephemeral, new IP address is attached to an instance for as long as it running. The script pulls the IP address for an instance and update the security group of Postgres RDS

![gitpod rds instance](../_docs/assets/week4/postgres-connect-prod.png)

# Create Cognito Trigger to insert user into database

## How it works:

[Lambda function](../aws/lambdas/cruddur-post-confirmation.py) <br />
A Lambda function(Post Confirmation Lambda Trigger) with the required permissions and [Psycopg2 Layer](https://github.com/jetbridge/psycopg2-lambda-layer) was created to insert a new entry/row into Postgres RDS when a new user register on Cruddur. To achieve this, a trigger was setup to fire Lambda function(Post Confirmation Lambda Trigger) on Cognito 'Post Sign-up'.
![Post Confirmation Lambda](../_docs/assets/week4/lambda.png)
![Post Confirmation Lambda Trigger](../_docs/assets/week4/cognitopostlambdacog.png)

# Create new activities with a database insert

![create a crud](../_docs/assets/week4/create-new-1activity.png)
![create a crud](../_docs/assets/week4/create-new-2activity.png)
