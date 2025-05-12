import { BaseModelInstance } from '@num/datakit';

import { builder } from '~/graphql/builder';

import { getAttachmentsByRef } from '~/documents/queries';

import { AttachmentSchema } from './attachment';

export const HasAttachmentsType = builder.interfaceType('HasAttachments', {
  fields: (t) => ({
    attachments: t.field({
      type: [AttachmentSchema],
      args: {},
      description: 'The list of the attachments of the object.',
      resolve: async (root, _args, ctx) => {
        const parent = root as BaseModelInstance;
        const type = await ctx.resolveTypeAssert(parent);

        const result = await getAttachmentsByRef(
          {
            refId: parent.id,
            refTypeId: type.id,
          },
          ctx,
        );

        return result;
      },
    }),
  }),
});
