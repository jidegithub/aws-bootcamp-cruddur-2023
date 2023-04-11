#!/usr/bin/env bash

# AWS set current space ip address and update rds security group rule
export ENVIRONMENT_IP=$(curl ifconfig.me)
source "/workspaces/aws-bootcamp-cruddur-2023/bin/rds/update-sg-rule"