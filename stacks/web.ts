import { getSecret } from '@num/infrakit';

import { use, StackContext, NextjsSite } from 'sst/constructs';

import { Api } from './api';

const hostedZones: Record<string, string | undefined> = {
  test: 'num.technanimals.com',
  uat: 'num.uat-digitech.co.za',
  prod: 'numcms.co.za',
};

export function Web({ stack, app }: StackContext) {
  const api = use(Api);

  const client = getSecret('client', stack, ['CLIENT_ID', 'CLIENT_SECRET']);
  const hostedZone = hostedZones[app.stage];

  const customDomain = hostedZone
    ? {
        hostedZone,
        domainName: hostedZone,
      }
    : undefined;

  const site = new NextjsSite(stack, 'site', {
    path: 'apps/web',
    customDomain,
    environment: {
      API_URL: api.url,
      ...client,
    },
  });

  stack.addOutputs({
    SITE: site.url || 'https://localhost:3000',
  });

  return site;
}
