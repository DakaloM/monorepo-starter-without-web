import { User } from '~/account/user';
import { Role, RoleIdentifier } from '~/assignee/role';
import { Category, CategoryName } from '~/case/category';
import { Context } from '~/context';
import { Attachment } from '~/documents/attachment';
import { createContext, destroyContext } from '~/test/context';
import { createEnv, destroyEnv, Environment } from '~/test/environment';
import { createFactory, Factory } from '~/test/factory';
import { gql, request } from '~/test/graphql';
import { TypeIdentifier } from '~/type';

describe('documents/graphql/attachment', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let category: Category;

  const query = gql`
    query Attachment($id: ID!) {
      attachment(id: $id) {
        id
      }
    }
  `;

  beforeAll(async () => {
    env = await createEnv({ db: true, cache: true, server: true });
  });

  afterAll(async () => {
    await destroyEnv(env);
  });

  let user: User;

  let attachment: Attachment;

  beforeEach(async () => {
    ctx = await createContext(env);
    factory = createFactory(ctx);
    const region = await factory.insert('region');
    const tenant = await factory.insert('tenant', { regionId: region.id });
    user = await factory.insert('user', { tenantId: tenant.id });
    const types = await factory.seed('types');
    category = await factory.insert('category');
    const numCase = await factory.insert('case', { categoryId: category.id });

    attachment = await factory.insert('attachment', {
      creatorId: user.id,
      refId: numCase.id,
      refTypeId: types[TypeIdentifier.Case].id,
    });

    ctx.auth.update(user);
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  it('should return attachment', async () => {
    const { data } = await request(env)
      .withContext(ctx)
      .query(query)
      .variables({ id: attachment.id })
      .expectNoErrors();

    expect(data?.attachment.id).toEqual(attachment.id);
  });
});

describe('documents/graphql/attachments', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let category: Category;
  let role: Role;

  const query = gql`
    query Attachments($input: AttachmentFilter!) {
      attachments(input: $input) {
        id
      }
    }
  `;

  beforeAll(async () => {
    env = await createEnv({ db: true, cache: true, server: true });
  });

  afterAll(async () => {
    await destroyEnv(env);
  });

  let user: User;

  let attachment: Attachment;

  beforeEach(async () => {
    ctx = await createContext(env);
    factory = createFactory(ctx);
    const region = await factory.insert('region');
    const tenant = await factory.insert('tenant', { regionId: region.id });
    user = await factory.insert('user', {tenantId: tenant.id});
    const types = await factory.seed('types');
    const roles = await factory.seed('roles');
    role = roles[RoleIdentifier.Assignee];
    category = await factory.insert('category');

    const numCase = await factory.insert('case', { categoryId: category.id });

    attachment = await factory.insert('attachment', {
      creatorId: user.id,
      refId: numCase.id,
      refTypeId: types[TypeIdentifier.Case].id,
    });

    await factory.insert('assignee', {
      roleId: role.id,
      objectId: user.id,
      refId: attachment.id,
      refTypeId: types[TypeIdentifier.Attachment].id,
    });

    ctx.auth.update(user);
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  it('should return attachments', async () => {
    const { data } = await request(env)
      .withContext(ctx)
      .query(query)
      .variables({ input: {} })
      .expectNoErrors();

    expect(data?.attachments).toHaveLength(1);
    expect(data?.attachments[0].id).toEqual(attachment.id);
  });
});
