import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';

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
