import { Category, CategoryName } from '~/case/category';
import { Context } from '~/context';
import { Attachment } from '~/documents/attachment';
import { Event, EventAction } from '~/event';
import { createContext, destroyContext } from '~/test/context';
import { Environment, createEnv, destroyEnv } from '~/test/environment';
import { Factory, createFactory } from '~/test/factory';
import { TypeIdentifier } from '~/type';

import { trashAttachment } from '../trashAttachment';

describe('documents/mutation/trashAttachment', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let category: Category;
  beforeAll(async () => {
    env = await createEnv();
  });

  afterAll(async () => {
    await destroyEnv(env);
  });

  beforeEach(async () => {
    ctx = await createContext(env);

    factory = createFactory(ctx);
    await factory.seed('types');
    await factory.seed('roles');
    category = await factory.insert('category');
    const region = await factory.insert('region');
    const tenant = await factory.insert('tenant', { regionId: region.id });
    ctx.auth.update(await factory.insert('user', {tenantId: tenant.id}));
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  it('should trash an attachment', async () => {
    const numCase = await factory.insert('case', { categoryId: category.id });
    const caseType = await ctx.resolveTypeAssert(TypeIdentifier.Case);
    const attachment = await factory.insert('attachment', {
      refId: numCase.id,
      refTypeId: caseType.id,
      creatorId: ctx.auth.user?.id,
      sequence: 1,
    });

    const response = await trashAttachment(attachment.id, ctx);
    const deletedAttachment = await Attachment.query(ctx.db)
      .findById(response.id)
      .throwIfNotFound();

    expect(deletedAttachment).toBeDefined();
    expect(deletedAttachment.deletedAt).toBeDefined();
    expect(deletedAttachment.deletedAt).not.toBeNull();
    expect(deletedAttachment).toMatchObject(response);

    const event = await Event.query(ctx.db).where({
      refId: numCase?.id,
      refTypeId: caseType.id,
      action: EventAction.TrashAttachment,
    });
    expect(event).toHaveLength(1);
  });
});
