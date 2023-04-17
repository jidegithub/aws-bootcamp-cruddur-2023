#!/usr/bin/env bash

# AWS set current space ip address and update rds security group rule
export ENVIRONMENT_IP=$(curl ifconfig.me)
source "/workspaces/aws-bootcamp-cruddur-2023/bin/rds/update-sg-rule"

#fargate task utils
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb

#aws CDK utils
npm install aws-cdk -g
cd /workspaces/aws-bootcamp-cruddur-2023/thumbing-serverless-cdk;
cp .env.example .env
npm i

#process-images
cd /workspaces/aws-bootcamp-cruddur-2023/aws/lambdas/process-images;
source "/workspaces/aws-bootcamp-cruddur-2023/bin/avatar/sharp"