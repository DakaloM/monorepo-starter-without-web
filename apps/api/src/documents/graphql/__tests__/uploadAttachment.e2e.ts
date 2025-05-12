import { HumanRole } from '@num/client';
import { faker } from '@num/testkit';

import { UserRole } from '~/account';
import { User } from '~/account/user';
import { Category } from '~/case/category';
import { Context } from '~/context';
import { createContext, destroyContext } from '~/test/context';
import { Environment, createEnv, destroyEnv } from '~/test/environment';
import { Factory, createFactory } from '~/test/factory';
import { gql, request } from '~/test/graphql';
import { TypeIdentifier } from '~/type';

describe('documents/graphql/uploadAttachment', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let user: User;
  let category: Category;

  const query = gql`
    mutation UploadAttachment($input: UploadAttachmentInput!) {
      uploadAttachment(input: $input) {
        id
        uploadUrl
      }
    }
  `;

  beforeAll(async () => {
    env = await createEnv({ server: true, db: true, cache: true });
  });

  afterAll(async () => {
    await destroyEnv(env);
  });

  beforeEach(async () => {
    ctx = await createContext(env);
    factory = createFactory(ctx);
    const region = await factory.insert('region');
    const tenant = await factory.insert('tenant', { regionId: region.id });
    user = await factory.insert('user', { role: HumanRole.Admin, tenantId: tenant.id});

    await factory.seed('types');
    await factory.seed('roles');
    category = await factory.insert('category');

    ctx.auth.update(user);
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  it('should return upload url', async () => {
    const numCase = await factory.insert('case', { categoryId: category.id });
    const { data, errors } = await request(env)
      .withContext(ctx)
      .query(query)
      .variables({
        input: {
          name: faker.system.commonFileName('pdf'),
          contentType: 'application/pdf',
          refTypeIdentifier: TypeIdentifier.Case,
          refId: numCase.id,
          contentLength: 100,
          confidential: false,
          assignees: [],
        },
      });

    expect(data?.uploadAttachment.id).toBeDefined();
    expect(data?.uploadAttachment.uploadUrl).toBeDefined();
  });
});
