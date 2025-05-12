import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { App } from 'sst/constructs';

export function getSecretsFromNames<T extends string>(
  secret: ISecret,
  names: T[],
): Record<T, string> {
  return names.reduce(
    (acc, name) => {
      acc[name] = secret.secretValueFromJson(name).toString();

      return acc;
    },
    {} as Record<T, string>,
  );
}

export function getSecret<T extends string>(
  name: string,
  scope: Construct,
  names: T[],
): Record<T, string> {
  const app = scope.node.root as App;
  const prefix = `/${app.stage}/${app.name}/`;
  const v = name.split('/').join('-');
  const secretName = name.startsWith(prefix) ? name : `${prefix}${v}`;
  const secret = Secret.fromSecretNameV2(scope, v, secretName);

  return getSecretsFromNames(secret, names);
}
