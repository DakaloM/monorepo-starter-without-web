import { NotFoundError } from '@num/serverkit';

import { Context } from '~/context';
import { Attachment } from '~/documents/attachment';

export async function getAttachmentById(id: string, ctx: Context) {
  const attachment = await Attachment.query(ctx.db)
    .findById(id)
    .withGraphFetched('address')
    .withGraphFetched('assignees.[user,tenant]');

  if (!attachment) {
    throw new NotFoundError({
      message: 'Attachment not found',
    });
  }

  return attachment;
}
