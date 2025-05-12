import { createBuilder } from '@num/datakit';
import { faker } from '@num/testkit';

import { Context } from '~/context';
import { TypeIdentifier } from '~/type';

import { Attachment, AttachmentState } from './attachment';

export const attachmentBuilder = createBuilder(
  // @ts-ignore
  async (attrs: Partial<Attachment>, _factory, ctx: Context) => {
    const refId = attrs.refId as string;
    const sequence = await ctx.bumpSequenceValue(refId, TypeIdentifier.Attachment);
    return Attachment.fromJson({
      name: faker.system.commonFileName('pdf'),
      contentType: 'application/pdf',
      contentLength: 100,
      state: AttachmentState.COMPLETED,
      sequence,
      ...attrs,
    });
  },
);
