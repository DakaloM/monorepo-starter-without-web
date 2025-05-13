import { getConfidentialAssignees } from '~/assignee/query';
import { Context } from '~/context';
import { EventAction } from '~/event';
import { TypeIdentifier } from '~/type';

import { Attachable } from '../attachable';
import { Attachment, AttachmentState } from '../attachment';

type Args = {
  refId: string;
  refTypeIdentifier: TypeIdentifier;
  name: string;
  contentType: string;
  contentLength: number;
  confidential: boolean;
  assignees: string[];
};

export async function createAttachment(args: Args, ctx: Context) {
  const creatorId = ctx.auth.user?.id as string;
  const type = await ctx.resolveTypeAssert(args.refTypeIdentifier);

  return await Attachment.transaction(ctx.db, async (trx) => {
    const sequence = await ctx.bumpSequenceValue(args.refId, TypeIdentifier.Attachment, trx);
    const data = Attachment.createSchema().parse({
      ...args,
      state: AttachmentState.IN_PROGRESS,
      creatorId,
      refTypeId: type.id,
      sequence,
    });

    const attachment = await Attachment.query(trx).insert({
      ...data,
      sequence,
    });

    const assignees = getConfidentialAssignees(
      {
        assignees: args.assignees,
        confidential: args.confidential,
      },
      creatorId,
    );

    await ctx.createEvent<Attachable>(
      {
        action: EventAction.Attach,
        refId: args.refId,
        refTypeIdentifier: args.refTypeIdentifier,
        change: { attachments: [attachment] },
        description: attachment.name,
        confidential: args.confidential,
        assignees,
      },
      trx,
    );

    await ctx.createEvent<Attachment>(
      {
        action: EventAction.Create,
        refId: attachment.id,
        refTypeIdentifier: TypeIdentifier.Attachment,
        change: attachment,
        description: attachment.name,
        confidential: false,
      },
      trx,
    );
    return attachment;
  });
}
