# Week 8 — Serverless Image Processing

- [Preparation](#preparation)
- [Implement CDK Stack](#implement-cdk-stack)
- [Serving Avatars via CloudFront]((#serving-avatars-via-cloudfront))

## Preparation

This week we need to use CDK (Cloud Development Kit) to create S3 buckets, Lambda functions, SNS topics, etc., allowing users to upload their avatars to update their profiles.
By default, AWS account will not execute cdk commands until you bootstrap it. Deploying stacks with the AWS CDK requires dedicated Amazon S3 buckets and other containers to be available to AWS CloudFormation during deployment.

```sh
cdk bootstrap "aws://$AWS_ACCOUNT_ID/$AWS_DEFAULT_REGION"
```
now you can run cdk commands.
![](../_docs/assets/week8/cdk-bootstrap.png)
# Implement CDK Stack

Firstly, manually create a S3 bucket named `assets.<domain_name>` (e.g., `assets.jidecruddur.site`), which will be used for serving the processed images in the profile page. In this bucket, create a folder named `banners`, and then upload a `banner.jpg` into the folder. The bucket was created manually so that the it's fireproof from `cdk destroy` command or any other cdk command that recreates or update resources. 

[CDK Stack](../thumbing-serverless-cdk/)

![](../_docs/assets/week8/cdk1.png)
![](../_docs/assets/week8/cdk2.png)

# Serve Avatars via CloudFront

![](../_docs/assets/week8/cloudfront-1png)
![](../_docs/assets/week8/cloudfront-2.png)
![](../_docs/assets/week8/cloudfront-3.png)

# Implement Users Profile Page

![](../_docs/assets/week8/user-profile.png)

# Implement Users Profile Form

![](../_docs/assets/week8/user-profile-form.png)

# Implement Backend Migrations

[Backend Migration](../bin/db/migrate)
![](../_docs/assets/week8/migration.png)

# Presigned URL generation via Ruby Lambda

[Lambda function](../aws/lambdas/cruddur-upload-avatar/)

![](../_docs/assets/week8/aws-lambda-avatar.png)

![](../_docs/assets/week8/aws-lambda-code.png)

![](../_docs/assets/week8/aws-avatar-logroup.png)

# HTTP API Gateway with Lambda Authorizer

[Lambda function](../aws/lambdas/lambda-authorizer/)
![](../_docs/assets/week8/authorizer1.png)
![](../_docs/assets/week8/authorizer2.png)
![](../_docs/assets/week8/authorizer3.png)
![](../_docs/assets/week8/authorizer4.png)
![](../_docs/assets/week8/lambda-auth-overview.png)

Create HTTP API in API Gateway and attach authorizer
![](../_docs/assets/week8/api-gateway1.png)
![](../_docs/assets/week8/api-gateway2.png)
![](../_docs/assets/week8/api-gateway4.png)
![](../_docs/assets/week8/api-gateway5.png)
![](../_docs/assets/week8/api-gateway6.png)
![](../_docs/assets/week8/api-gateway7.png)
![](../_docs/assets/week8/api-gateway8.png)
![](../_docs/assets/week8/api-gateway9.png)

# API gateway custom domain

- Configure a custom domain api.jidecruddur.site
- Configure Mapping between API gateway and the custom domain
- Add an alias for api.jidecruddur.site in route53 to point to the API gateway

# Create JWT Lambda Layer

[Lambda layer script](../bin/lambda-layers/)
![](../_docs/assets/week/../week8/lambda-layer.png)

# Render Avatars in App via CloudFront

![](../_docs/assets/week/../week8/cloudfront1.png)
![](../_docs/assets/week/../week8/cloudfront2.png) 
![](../_docs/assets/week/../week8/cloudfront3.png)
![](../_docs/assets/week/../week8/cloudfront4.png)
![](../_docs/assets/week/../week8/cloudfront5.png)
![](../_docs/assets/week/../week8/cloudfront6.png)
![](../_docs/assets/week/../week8/cloudfront7.png)