import { RoleIdentifier } from '@num/client';
import { faker } from '@num/testkit';

import { Role } from '~/account';
import { User } from '~/account/user';
import { Category } from '~/case/category';
import { Context } from '~/context';
import { Attachment, AttachmentState } from '~/documents/attachment';
import { ContentType } from '~/documents/contentTypes';
import { createContext, destroyContext } from '~/test/context';
import { createEnv, destroyEnv, Environment } from '~/test/environment';
import { createFactory, Factory } from '~/test/factory';
import { gql, request } from '~/test/graphql';
import { Type, TypeIdentifier } from '~/type';

describe('documents/graphql/hasAttachments', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let user: User;
  let type: Type;
  let category: Category;
  let role: Role;

  let attachment: Attachment;

  const query = gql`
    query Case($id: ID!) {
      case(id: $id) {
        attachments {
          id
          name
        }
      }
    }
  `;

  beforeAll(async () => {
    env = await createEnv({ db: true, cache: true, server: true });
  });

  afterAll(async () => {
    await destroyEnv(env);
  });

  beforeEach(async () => {
    ctx = await createContext(env);
    factory = createFactory(ctx);
    const region = await factory.insert('region');
    const tenant = await factory.insert('tenant', { regionId: region.id });
    user = await factory.insert('user', {tenantId: tenant.id});
    const types = await factory.seed('types');
    const roles = await factory.seed('roles');
    type = types[TypeIdentifier.Case];
    role = roles[RoleIdentifier.Owner];

    ctx.auth.update(user);
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  test('should return attachments on a case with user assigned to confidential attachments', async () => {
    category = await factory.insert('category');
    const numCase = await factory.insert('case', { categoryId: category.id });
    await factory.insert('assignee', {
      roleId: role.id,
      objectId: user.id,
      refId: numCase.id,
      refTypeId: type.id,
    });

    const contentType: ContentType = 'application/pdf';
    const confidentialAttachments = await factory.insertMany(5, 'attachment', () => ({
      refId: numCase.id,
      creatorId: user.id,
      refTypeId: type.id,
      name: faker.system.commonFileName('pdf'),
      contentType,
      contentLength: 100,
      state: AttachmentState.COMPLETED,
      confidential: true,
    }));

    await factory.insertMany(confidentialAttachments.length, 'assignee', (i) => ({
      roleId: role.id,
      objectId: user.id,
      refId: confidentialAttachments[i].id,
      refTypeId: type.id,
    }));

    const nonConfidentialAttachments = await factory.insertMany(4, 'attachment', () => ({
      refId: numCase.id,
      creatorId: user.id,
      refTypeId: type.id,
      name: faker.system.commonFileName('pdf'),
      contentType,
      contentLength: 100,
      state: AttachmentState.COMPLETED,
      confidential: false,
    }));

    const { data } = await request(env)
      .withContext(ctx)
      .query(query)
      .variables({ id: numCase.id })
      .expectNoErrors();

    expect(data?.case.attachments).toHaveLength(
      nonConfidentialAttachments.length + confidentialAttachments.length,
    );
  });

  test('should return attachments on a case with user not assigned to confidential attachments', async () => {
    category = await factory.insert('category');
    const numCase = await factory.insert('case', { categoryId: category.id });
    await factory.insert('assignee', {
      roleId: role.id,
      objectId: user.id,
      refId: numCase.id,
      refTypeId: type.id,
    });

    const contentType: ContentType = 'application/pdf';
    const confidentialAttachments = await factory.insertMany(5, 'attachment', () => ({
      refId: numCase.id,
      creatorId: user.id,
      refTypeId: type.id,
      name: faker.system.commonFileName('pdf'),
      contentType,
      contentLength: 100,
      state: AttachmentState.COMPLETED,
      confidential: true,
    }));

    const nonConfidentialAttachments = await factory.insertMany(4, 'attachment', () => ({
      refId: numCase.id,
      creatorId: user.id,
      refTypeId: type.id,
      name: faker.system.commonFileName('pdf'),
      contentType,
      contentLength: 100,
      state: AttachmentState.COMPLETED,
      confidential: false,
    }));

    const { data } = await request(env)
      .withContext(ctx)
      .query(query)
      .variables({ id: numCase.id })
      .expectNoErrors();

    expect(data?.case.attachments).toHaveLength(nonConfidentialAttachments.length);
  });
});
