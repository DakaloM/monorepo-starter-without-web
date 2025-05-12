import { builder } from '~/graphql/builder';

import { isActiveUser } from '~/account/shield';
import { getConfidentialAssignees } from '~/assignee/query';
import { EventAction } from '~/event';
import { TypeIdentifier } from '~/type';

import { Attachment } from '../attachment';
import { AttachmentSchema } from './attachment';

const UpdateAttachmentInput = builder.inputType('UpdateAttachmentInput', {
  fields: (t) => ({
    id: t.string({ required: true }),
    confidential: t.boolean({ required: false }),
    assignees: t.stringList({ required: false }),
    description: t.string({ required: false }),
    tags: t.stringList({ required: false }),
  }),
  description: 'Input type for uploading an attachment.',
});

builder.mutationField('updateAttachment', (t) =>
  t.field({
    args: {
      input: t.arg({ type: UpdateAttachmentInput, required: true }),
    },
    type: AttachmentSchema,
    shield: isActiveUser,
    description: 'Updates an attachment.',
    resolve: async (_parent, { input: args }, ctx) => {
      return Attachment.transaction(ctx.db, async (trx) => {
        const attachment = await Attachment.query(trx).patchAndFetchById(args.id, {
          confidential: args.confidential || undefined,
          description: args.description || undefined,
        });

        const assignees = getConfidentialAssignees(
          {
            assignees: args.assignees || [],
            confidential: args.confidential || false,
          },
          ctx.auth?.user?.id as string,
        );

        await ctx.createEvent<Attachment>(
          {
            action: EventAction.Update,
            refId: attachment.id,
            refTypeIdentifier: TypeIdentifier.Attachment,
            change: args as Partial<Attachment>,
            description: attachment.name,
            confidential: false,
          },
          trx,
        );

        return attachment;
      });
    },
  }),
);
