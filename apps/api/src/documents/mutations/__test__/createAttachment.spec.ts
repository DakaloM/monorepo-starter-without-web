import { RoleIdentifier } from '@num/client';

import { Category } from '~/case/category';
import { Context } from '~/context';
import { Attachment } from '~/documents/attachment';
import { Event, EventAction } from '~/event';
import { createContext, destroyContext } from '~/test/context';
import { Environment, createEnv, destroyEnv } from '~/test/environment';
import { Factory, createFactory } from '~/test/factory';
import { TypeIdentifier } from '~/type';

import { createAttachment } from '../createAttachment';
import { Tenant } from '~/account/tenant';

describe('documents/mutation/createAttachment', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let category: Category;
  let tenant: Tenant;

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
    tenant = await factory.insert('tenant', { regionId: region.id });
    ctx.auth.update(await factory.insert('user', {tenantId: tenant.id}));
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  it('should create a non confidential attachment to a case', async () => {
    
    const assigneeUser = await factory.insert('user', {tenantId: tenant.id});
    const numCase = await factory.insert('case', { categoryId: category.id });
    const input = {
      refId: numCase.id,
      name: 'CaseDocument.pdf',
      contentType: 'application/pdf',
      contentLength: 512,
      confidential: false,
    };
    const response = await createAttachment(
      { ...input, refTypeIdentifier: TypeIdentifier.Case, assignees: [assigneeUser.id] },
      ctx,
    );
    const attachment = await Attachment.query(ctx.db).findById(response.id).throwIfNotFound();

    expect(attachment).toBeDefined();
    const caseType = await ctx.resolveTypeAssert(TypeIdentifier.Case);
    expect(attachment.refTypeId).toEqual(caseType.id);
    expect(attachment).toMatchObject(input);
    expect(attachment).toMatchObject(response);

    const events = await Event.query(ctx.db)
      .where({
        refId: numCase?.id,
        refTypeId: caseType.id,
        action: EventAction.Attach,
      })
      .withGraphFetched('assignees.role');
    expect(events).toHaveLength(1);
    const event = events[0];
    expect(event.confidential).toEqual(false);
    expect(event.assignees.length).toEqual(1);
    expect(event.assignees[0].objectId).toEqual(ctx.auth.user?.id);
    expect(event.assignees[0].role.identifier).toEqual(RoleIdentifier.Owner);
    const eventAttachments = event.change as { attachments: Attachment[] };
    expect(eventAttachments.attachments).toHaveLength(1);
    expect(eventAttachments.attachments[0].id).toEqual(response.id);
  });

  it('should create a confidential attachment to a case', async () => {
    const region = await factory.insert('region');
    const tenant = await factory.insert('tenant', { regionId: region.id });
    const assigneeUser = await factory.insert('user', {tenantId: tenant.id});
    const numCase = await factory.insert('case', { categoryId: category.id });
    const input = {
      refId: numCase.id,
      name: 'CaseDocument.pdf',
      contentType: 'application/pdf',
      contentLength: 512,
      confidential: true,
    };
    const response = await createAttachment(
      { ...input, refTypeIdentifier: TypeIdentifier.Case, assignees: [assigneeUser.id] },
      ctx,
    );
    const attachment = await Attachment.query(ctx.db).findById(response.id).throwIfNotFound();

    expect(attachment).toBeDefined();
    const caseType = await ctx.resolveTypeAssert(TypeIdentifier.Case);
    expect(attachment.refTypeId).toEqual(caseType.id);
    expect(attachment).toMatchObject(input);
    expect(attachment).toMatchObject(response);

    const events = await Event.query(ctx.db)
      .where({
        refId: numCase?.id,
        refTypeId: caseType.id,
        action: EventAction.Attach,
      })
      .withGraphFetched('assignees.role');
    expect(events).toHaveLength(1);
    const event = events[0];
    expect(event.confidential).toEqual(true);
    expect(event.assignees.length).toEqual(2);

    const owners = event.assignees.filter(
      (assignee) => assignee.role.identifier === RoleIdentifier.Owner,
    );

    expect(owners).toHaveLength(1);
    const owner = owners[0];
    expect(owner.objectId).toEqual(ctx.auth.user?.id);
    const normalAssignees = event.assignees.filter(
      (assignee) => assignee.role.identifier === RoleIdentifier.Assignee,
    );
    expect(normalAssignees).toHaveLength(1);
    const normalAssignee = normalAssignees[0];
    expect(normalAssignee.objectId).toEqual(assigneeUser.id);
    const eventAttachments = event.change as { attachments: Attachment[] };
    expect(eventAttachments.attachments).toHaveLength(1);
    expect(eventAttachments.attachments[0].id).toEqual(response.id);
  });
});
