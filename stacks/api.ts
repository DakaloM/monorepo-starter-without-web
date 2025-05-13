/* eslint-disable import/no-extraneous-dependencies */
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { getSecret } from '@repo/infrakit';
import { Duration } from 'aws-cdk-lib';
import {
  Api as ApiGateway,
  ApiRouteProps,
  StackContext,
  use,
  Function as Handler,
} from 'sst/constructs';

import { Database } from './database';
import { Storage } from './storage';

export function Api({ stack, app }: StackContext) {
  const bucket = use(Storage);
  const database = use(Database);

  const mailCredentials = getSecret('mail', stack, [
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_FROM_EMAIL',
    'MAIL_PASSWORD',
    'MAIL_SECURE',
    'MAIL_USER',
  ]);

  const environment = {
    REGION: app.region,
    STAGE: stack.stage,
    ATTACHMENTS_BUCKET_NAME: bucket.bucketName,
    ATTACHMENTS_REGION: app.region,
    DATABASE_URL: database.url,
    SERVER_PORT: '8080',
    ...mailCredentials,
  };

  const clientAuthorizerHandler = new Handler(stack, 'ClientAuthorizerHandler', {
    handler: 'apps/api/src/lambda/authorizer/client.handler',
    functionName: app.logicalPrefixedName('client-authorizer'),
    environment,
  });

  const identityAuthorizerHandler = new Handler(stack, 'IdentityAuthorizerHandler', {
    handler: 'apps/api/src/lambda/authorizer/identity.handler',
    functionName: app.logicalPrefixedName('identity-authorizer'),
    environment,
  });

  const clientPolicyAuthorizer = new HttpLambdaAuthorizer(
    'ClientAuthorizer',
    clientAuthorizerHandler,
    {
      authorizerName: app.logicalPrefixedName('client-authorizer'),
      responseTypes: [HttpLambdaResponseType.IAM],
      resultsCacheTtl: Duration.minutes(30),
    },
  );

  const identityPolicyAuthorizer = new HttpLambdaAuthorizer(
    'IdentityAuthorizer',
    identityAuthorizerHandler,
    {
      authorizerName: app.logicalPrefixedName('identity-authorizer'),
      responseTypes: [HttpLambdaResponseType.IAM],
      resultsCacheTtl: Duration.minutes(30),
    },
  );

  const api = new ApiGateway(stack, 'api', {
    authorizers: {
      CLIENT: {
        type: 'lambda',
        cdk: {
          authorizer: clientPolicyAuthorizer,
        },
      },
      IDENTITY: {
        type: 'lambda',
        cdk: {
          authorizer: identityPolicyAuthorizer,
        },
      },
    },
    defaults: {
      payloadFormatVersion: '2.0',
      function: {
        bind: [bucket],
        environment,
      },
    },
    accessLog: false,
    routes: {
      // 'POST /api/auth/{proxy+}': {
      //   // authorizer: 'CLIENT',
      //   function: {
      //     handler: 'apps/api/src/lambda/server.handler',
      //   },
      // },
      'POST /graphql': {
        // authorizer: 'IDENTITY',
        function: {
          handler: 'apps/api/src/lambda/graphql/server.handler',
          environment,
        },
      },
    },
  });

  stack.addOutputs({
    API: api.url,
  });

  return api;
}

export type Routes = Record<string, ApiRouteProps<'CLIENT' | 'IDENTITY'>>;
