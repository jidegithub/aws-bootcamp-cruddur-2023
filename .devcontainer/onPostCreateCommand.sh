#!/usr/bin/env bash

#generate env for Frontend Reactjs
source /workspaces/aws-bootcamp-cruddur-2023/bin/frontend/generate_env

#generate env for Backend Flask
source /workspaces/aws-bootcamp-cruddur-2023/bin/backend/generate_env

#fargate task utils
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb

