import { getSecret } from '@repo/infrakit';
import { Duration, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { App, StackContext, use } from 'sst/constructs';

import { Network } from './network';

export function generateSecret(scope: Construct, id: string, username: string): Secret {
  const app = scope.node.root as App;
  return new Secret(scope, id, {
    secretName: `/${app.stage}/${app.name}/db-secret`,
    generateSecretString: {
      secretStringTemplate: JSON.stringify({
        username,
      }),
      excludePunctuation: true,
      excludeCharacters: '/@"\' ',
      generateStringKey: 'password',
    },
  });
}

export function Database({ stack, app }: StackContext) {
  const devSecret = getSecret('db', stack, ['username']);
  const multiAz = app.stage === 'prod';
  const backupRetention = app.stage === 'prod' ? Duration.days(7) : Duration.days(0);
  const removalPolicy = app.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
  const deletionProtection = app.stage === 'prod';

  const { vpc, securityGroup } = use(Network);

  const secret = generateSecret(stack, 'DatabaseSecret', app.stage);
  const credentials = rds.Credentials.fromSecret(secret);
  const db = new rds.DatabaseInstance(stack, 'postgres-db', {
    vpc,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PUBLIC,
    },
    engine: rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_14_5,
    }),
    securityGroups: [securityGroup],
    instanceType: new ec2.InstanceType('t3.micro'),
    credentials,
    multiAz,
    allocatedStorage: 10,
    maxAllocatedStorage: 20,
    allowMajorVersionUpgrade: false,
    autoMinorVersionUpgrade: true,
    backupRetention,
    deleteAutomatedBackups: true,
    removalPolicy,
    deletionProtection,
    instanceIdentifier: app.logicalPrefixedName('db'),
    databaseName: app.stage,
    publiclyAccessible: true,
  });

  db.connections.allowFromAnyIpv4(ec2.Port.tcp(5432));
  const password = secret.secretValueFromJson('password').toString();
  const username = secret.secretValueFromJson('username').toString();
  const host = db.dbInstanceEndpointAddress;
  const port = db.dbInstanceEndpointPort;

  const url = `postgresql://${username}:${password}@${host}:${port}/${app.stage}`;

  return {
    url,
  };
}
