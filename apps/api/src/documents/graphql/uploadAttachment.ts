import { builder } from '~/graphql/builder';

import { isActiveUser } from '~/account/shield';
import { createAttachment } from '~/documents/mutations';
import { TypeIdentifier } from '~/type';

import { AttachmentSchema } from './attachment';

const UploadAttachmentInput = builder.inputType('UploadAttachmentInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    contentType: t.string({ required: true }),
    contentLength: t.int({ required: true }),
    confidential: t.boolean({ required: true }),
    description: t.string({ required: false }),
    refId: t.string({ required: true }),
    refTypeIdentifier: t.string({ required: true }),
    assignees: t.stringList({ required: true }),
  }),
  description: 'Input type for uploading an attachment.',
});

builder.mutationField('uploadAttachment', (t) =>
  t.field({
    args: {
      input: t.arg({ type: UploadAttachmentInput, required: true }),
    },
    type: AttachmentSchema,
    shield: isActiveUser,
    description: 'Uploads an attachment.',
    resolve: async (_parent, { input: args }, ctx) => {
      const attachment = await createAttachment(
        {
          contentLength: args.contentLength,
          contentType: args.contentType,
          name: args.name,
          refId: args.refId,
          refTypeIdentifier: args.refTypeIdentifier as TypeIdentifier,
          confidential: args.confidential,
          assignees: args.assignees,
        },
        ctx,
      );

      return attachment;
    },
  }),
);
