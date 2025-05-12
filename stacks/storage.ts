import { RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { StackContext, Bucket } from 'sst/constructs';

export function Storage({ stack, app }: StackContext) {
  const { stage } = app;
  const isProd = stage === 'prod';
  const blockPublicAccess = new BlockPublicAccess({
    blockPublicAcls: false,
  });

  const bucket = new Bucket(stack, 'Bucket', {
    name: app.logicalPrefixedName('storage-bucket'),
    cdk: {
      bucket: {
        removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: !isProd,
        blockPublicAccess,
        objectOwnership: ObjectOwnership.OBJECT_WRITER,
      },
    },
    cors: [
      {
        allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      },
    ],
  });

  return bucket;
}
