import { User } from '~/account/user';
import { Case } from '~/case';
import { Category, CategoryName } from '~/case/category';
import { Context } from '~/context';
import { Attachment, AttachmentState } from '~/documents/attachment';
import { createContext, destroyContext } from '~/test/context';
import { createEnv, destroyEnv, Environment } from '~/test/environment';
import { createFactory, Factory } from '~/test/factory';
import { gql, request } from '~/test/graphql';
import { Type, TypeIdentifier } from '~/type';

describe('documents/graphql/deleteAttachment', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let type: Type;
  let numCase: Case;
  let category: Category;
  const query = gql`
    mutation DeleteAttachment($id: ID!) {
      deleteAttachment(id: $id) {
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
    category = await factory.insert('category');
    numCase = await factory.insert('case', { categoryId: category.id });
    type = types[TypeIdentifier.Case];

    attachment = await factory.insert('attachment', {
      creatorId: user.id,
      refId: numCase.id,
      refTypeId: type.id,
    });

    ctx.auth.update(user);
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  it('should add deletedAt to attachment', async () => {
    const { data } = await request(env)
      .withContext(ctx)
      .query(query)
      .variables({ id: attachment.id })
      .expectNoErrors();

    expect(data.deleteAttachment.id).toEqual(attachment.id);

    const deletedAttachment = await Attachment.query(ctx.db)
      .findById(attachment.id)
      .throwIfNotFound();

    expect(deletedAttachment.deletedAt).toBeDefined();
  });

  it('should not change deletedAt when already deleted', async () => {
    const deletedAt = new Date('2020-01-01');
    const attachment = await factory.insert('attachment', {
      creatorId: user.id,
      refId: numCase.id,
      refTypeId: type.id,
      sequence: 2,
      deletedAt,
    });

    const { data } = await request(env)
      .withContext(ctx)
      .query(query)
      .variables({ id: attachment.id })
      .expectNoErrors();

    expect(data.deleteAttachment.id).toEqual(attachment.id);

    const deletedAttachment = await Attachment.query(ctx.db)
      .findById(attachment.id)
      .throwIfNotFound();

    expect(deletedAttachment.deletedAt).toEqual(deletedAt);
    expect(deletedAttachment.deletedAt).toMatchSnapshot();
  });
});
