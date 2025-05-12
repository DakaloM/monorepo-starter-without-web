import { createBuilder } from '@num/datakit';
import { faker } from '@num/testkit';

import * as argon2 from 'argon2';
import 'argon2';
import { Client, ClientScope } from '~/auth/client';

export const clientBuilder = createBuilder(async (attrs: Partial<Client>, _factory, _ctx) => {
  const secret = attrs.secret || faker.internet.password(32);
  const encryptedSecret = await argon2.hash(secret);

  return Client.fromJson({
    ...attrs,
    name: faker.company.name(),
    secret: encryptedSecret,
    scope: [ClientScope.Auth],
  });
});
