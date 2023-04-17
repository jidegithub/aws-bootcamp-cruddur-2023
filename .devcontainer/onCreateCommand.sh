#!/usr/bin/env bash

# npm install frontend
cd /workspaces/aws-bootcamp-cruddur-2023/frontend-react-js && npm update -g && npm i;

# backend pip requirements
cd /workspaces/aws-bootcamp-cruddur-2023/backend-flask && pip3 install -r requirements.txt;

# Postgresql
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list';
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -;
sudo apt-get update -y;
sudo apt install -y postgresql-client-13 libpq-dev

#process-images
cd /workspaces/aws-bootcamp-cruddur-2023/aws/lambdas/process-images;
source /workspaces/aws-bootcamp-cruddur-2023/bin/avatar/sharp

#aws CDK utils
npm install aws-cdk -g
cd /workspaces/aws-bootcamp-cruddur-2023/thumbing-serverless-cdk;
cp .env.example .env
npm i

# AWS set current space ip address and update rds security group rule
export ENVIRONMENT_IP=$(curl ifconfig.me)
source /workspaces/aws-bootcamp-cruddur-2023/bin/rds/update-sg-rule

# #generate env for Frontend Reactjs
# source /workspaces/aws-bootcamp-cruddur-2023/bin/frontend/generate_env

# #generate env for Backend Flask
# source /workspaces/aws-bootcamp-cruddur-2023/bin/backend/generate_env