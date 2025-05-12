import { SecretValue } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { StackContext, use } from 'sst/constructs';

export function Credentials({ stack, app }: StackContext) {
  const user = new iam.User(stack, 'DockerPublisher', {
    userName: app.logicalPrefixedName('docker-publisher'),
  });

  const accessKey = new iam.AccessKey(stack, 'DockerPublisherAccessKey', {
    user,
  });

  new secretsmanager.Secret(stack, 'instance-user', {
    secretName: `/${app.stage}/${app.name}/instance-user`,
    secretObjectValue: {
      accessKeyId: SecretValue.unsafePlainText(accessKey.accessKeyId),
      secretAccessKey: accessKey.secretAccessKey,
    },
  });

  const policy = new iam.Policy(stack, 'InstancePolicy', {
    policyName: app.logicalPrefixedName('instance-policy'),
    statements: [
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${app.region}:${app.account}:secret:/*/{${app.name}}/*`,
        ],
      }),
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [`arn:aws:ssm:${app.region}:${app.account}:parameter/${app.name}/*`],
      }),
    ],
  });

  user.attachInlinePolicy(policy);

  return {
    user,
  };
}
