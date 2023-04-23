#!/usr/bin/env bash

cd /workspaces/aws-bootcamp-cruddur-2023

#generate env for Frontend Reactjs
./bin/frontend/generate_env

#generate env for Backend Flask
./bin/backend/generate_env

#ecr login
source ./bin/ecr/login

#fargate task utils
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb

