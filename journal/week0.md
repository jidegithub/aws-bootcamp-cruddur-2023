# Week 0 — Billing and Architecture
### Recreate the Logical Architectural Diagram  

## click here [Lucid chart](https://lucid.app/lucidchart/invitations/accept/inv_9e4c4126-1bbe-4c16-87eb-e9c588fa6010) to preview Logical diagram. 

### Installation processes
- I installed AWS CLI in gitpod and added the configuration block to the the gitpod yml file as instructed  
- I added AWS credentials as environment variables with the folloing commands
```bash
export AWS_ACCESS_KEY_ID="accesskey"
export AWS_SECRET_ACCESS_KEY="secretkey"
export AWS_DEFAULT_REGION="us-east-1"
```
- I made sure environment variables will remain in my workspace environment by running:
```bash
gp env AWS_ACCESS_KEY_ID="accesskey"
gp env AWS_SECRET_ACCESS_KEY="secretkey"
gp env AWS_DEFAULT_REGION="us-east-1"
```
- I confirmed my AWS CLI was installed and correctly configured with the command below:
```bash
aws sts get-caller-identity
```

- I created a Billing Alarm and budgets using my account ID on the ClI following the tutorial video made for us
   I got my Account ID by running the following command:
```bash
aws sts get-caller-identity --query Account --output text
```
- I saved the output which was my account ID as an environment variable
```bash
export AWS_ACCOUNT_ID="********2163"
gp env AWS_ACCOUNT_ID="********2163"
```
- I created a budget
