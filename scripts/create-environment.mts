import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import fs from 'node:fs/promises';

import config from '../env.json' assert { type: "json" };

const {
  AWS_REGION: region= 'af-south-1',
  STAGE: stage = 'staging',
  PROJECT_NAME: project = 'num',
} = process.env;


const secretsManagerClient = new SecretsManagerClient({region});
const ssmClient = new SSMClient({
  region,
});

export async function getEnvironment(names: string[], getValue: GetValue | GetGroupValues) {
  const promises = (
    await Promise.all(
      names.map(async (n) => {
        const name = `/${stage}/${project}/${n}`;
        const v = await getValue(name);
        const value =
          typeof v === 'string'
            ? {
                [name]: v,
              }
            : v;

        return value;
      }),
    )
  ).reduce((acc, cur) => ({ ...acc, ...cur }), {});

  return promises;
}

export async function getSecretGroup(name: string) {
  const { SecretString } = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: name,
    }),
  );

  if (!SecretString) {
    throw new Error('SecretString is undefined');
  }

  return JSON.parse(SecretString);
}

export async function getParam(name: string) {
  const { Parameter } = await ssmClient.send(
    new GetParameterCommand({
      Name: name,
    }),
  );

  if (!Parameter?.Value) {
    throw new Error('Parameter is undefined');
  }

  return Parameter.Value;
}

export async function createEnvironment() {
  const { plain } = config;
  const secrets = await getEnvironment(config.secrets, getSecretGroup);
  const params = await getEnvironment(config.parameters, getParam);

  const env = {
    ...secrets,
    ...params,
    ...plain,
  };

  const root = process.cwd();

  await fs.writeFile(
    `${root}/.env`,
    Object.entries(env)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n'),
  );
}

type GetValue = (name: string) => Promise<string>;
type GetGroupValues = (name: string) => Promise<Record<string, string>>;
