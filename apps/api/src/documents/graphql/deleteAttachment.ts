import { builder } from '~/graphql/builder';

import { allow } from 'graphql-shield';

import { trashAttachment } from '../mutations';
import { AttachmentSchema } from './attachment';

builder.mutationField('deleteAttachment', (t) =>
  t.field({
    type: AttachmentSchema,
    shield: allow,
    args: {
      id: t.arg.id({
        required: true,
      }),
    },
    resolve: async (_parent, args, ctx) => trashAttachment(args.id.toString(), ctx),
  }),
);
