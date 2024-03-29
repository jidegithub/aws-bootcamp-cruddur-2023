import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns'
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
const dotenv = require('dotenv');

//load env variables
dotenv.config()
const oneDayCron = 24 * 60 * 60; // in seconds

export class ThumbingServerlessCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const uploadsBucketName: string = process.env.UPLOADS_BUCKET_NAME as string;
    const assetsBucketName: string = process.env.ASSETS_BUCKET_NAME as string;
    const folderInput: string = process.env.THUMBING_S3_FOLDER_INPUT as string;
    const folderOutput: string = process.env.THUMBING_S3_FOLDER_OUTPUT as string;
    const webhookUrl: string = process.env.THUMBING_WEBHOOK_URL as string;
    const topicName: string = process.env.THUMBING_TOPIC_NAME as string;
    const functionPath: string = process.env.THUMBING_FUNCTION_PATH as string;
    console.log('uploadsBucketName', uploadsBucketName)
    console.log('assetsBucketName',assetsBucketName)
    console.log('folderInput',folderInput)
    console.log('folderOutput',folderOutput)
    console.log('webhookUrl',webhookUrl)
    console.log('topicName',topicName)
    console.log('functionPath',functionPath)
    
    // The code that defines your stack goes here
    const uploadsBucket = this.createBucket(uploadsBucketName);
    // importing an existing bucket this way means the bucket doesn't get on cdk destroy
    const assetsBucket = this.importBucket(assetsBucketName);

    //create a lambda
    const lambda = this.createLambda(
      functionPath, 
      uploadsBucketName, 
      assetsBucketName, 
      folderInput, 
      folderOutput
      );

    //create topic and subscription
    const snsTopic = this.createSnsTopic(topicName);
    this.createSnsSubscription(snsTopic,webhookUrl);

    //add s3 event notifications and subscription
    this.createS3NotifyToLambda(folderInput, lambda,uploadsBucket);
    this.createS3NotifyToSns(folderOutput,snsTopic,assetsBucket);

    //create policies
    const s3UploadsReadWritePolicy = this.createPolicyBucketAccess(uploadsBucket.bucketArn);
    const s3AssetsReadWritePolicy = this.createPolicyBucketAccess(assetsBucket.bucketArn);
    this.createPolicyEmptyBucket(uploadsBucket.bucketArn)
    // const snsPublishPolicy = this.createPolicySnSPublish(snsTopic.topicArn);

    //attach policies for permission
    lambda.addToRolePolicy(s3UploadsReadWritePolicy);
    lambda.addToRolePolicy(s3AssetsReadWritePolicy);
    // lambda.addToRolePolicy(snsPublishPolicy);
  }
  

  createBucket(bucketName: string): s3.IBucket {
    const logicalName: string = 'UploadsBucket';
    const bucket = new s3.Bucket(this, logicalName, {
      bucketName: bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    bucket.addLifecycleRule({
      expiration: cdk.Duration.seconds(oneDayCron),
      id: 'EmptyBucket'
    });
    return bucket;
  }

  importBucket(bucketName: string): s3.IBucket {
    const bucket =  s3.Bucket.fromBucketName(this, 'AssetsBucket', bucketName)
    return bucket;
  }

  createLambda(functionPath: string, uploadsBucketName: string, assetsBucketName: string, folderInput: string, folderOutput: string): lambda.IFunction {
    const lambdaFunction = new lambda.Function(this, 'ThumbLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(functionPath),
      timeout: cdk.Duration.seconds(15),
      environment: {
        DEST_BUCKET_NAME: assetsBucketName,
        FOLDER_INPUT: folderInput,
        FOLDER_OUTPUT: folderOutput,
        PROCESS_WIDTH: '512',
        PROCESS_HEIGHT: '512'
      }
    });
    return lambdaFunction;
  }

  createS3NotifyToLambda(prefix: string, lambda: lambda.IFunction, bucket: s3.IBucket): void {
    const destination = new s3n.LambdaDestination(lambda);
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      destination,
      // {prefix: prefix} // folder to contain the original images
    )
  }

  createPolicyBucketAccess(bucketArn: string){
    const s3ReadWritePolicy = new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:PutObject',
      ],
      resources: [
        `${bucketArn}/*`,
      ]
    });
    return s3ReadWritePolicy;
  }

  createPolicyEmptyBucket(bucketArn: string){
    const s3EmptyBucketPolicy = new iam.PolicyStatement({
      // effect: iam.Effect.ALLOW,
      actions: ['s3:ListBucket', 's3:DeleteObject'],
      resources: [`${bucketArn}/*`],
      conditions: {
        DateGreaterThan: { 's3:objectCreateTime': new Date(Date.now() - oneDayCron).toISOString() }
      }
    });
    return s3EmptyBucketPolicy;
  }

  createSnsTopic(topicName: string): sns.ITopic{
    const logicalName = "ThumbingTopic";
    const snsTopic = new sns.Topic(this, logicalName, {
      topicName: topicName
    });
    return snsTopic;
  }

  createSnsSubscription(snsTopic: sns.ITopic, webhookUrl: string): sns.Subscription {
    const snsSubscription = snsTopic.addSubscription(
      new subscriptions.UrlSubscription(webhookUrl)
    )
    return snsSubscription;
  }

  createS3NotifyToSns(prefix: string, snsTopic: sns.ITopic, bucket: s3.IBucket): void {
    const destination = new s3n.SnsDestination(snsTopic)
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT, 
      destination,
      {prefix: prefix}
    );
  }

  // createPolicySnSPublish(topicArn: string){
  //   const snsPublishPolicy = new iam.PolicyStatement({
  //     actions: [
  //       'sns:Publish',
  //     ],
  //     resources: [
  //       topicArn
  //     ]
  //   });
  //   return snsPublishPolicy;
  // }
}
