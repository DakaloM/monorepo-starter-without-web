import { Context } from '~/context';
import { EventAction } from '~/event';
import { Type, TypeIdentifier } from '~/type';

import { Attachable } from '../attachable';
import { Attachment } from '../attachment';

export async function updateAttachment(id: string, ctx: Context) {
  return await Attachment.transaction(ctx.db, async (trx) => {
    const attachment = await Attachment.query(trx)
      .whereNull('attachment.deletedAt')
      .where('attachment.id', '=', id)
      .first();

    if (!attachment) {
      const attachment = new Attachment();
      attachment.id = id;
      return attachment;
    }

    await attachment.$query(ctx.db).patch({
      deletedAt: new Date(),
    });
    const type = await Type.query(trx).findById(attachment.refTypeId).throwIfNotFound();
    await ctx.createEvent<Attachable>(
      {
        action: EventAction.TrashAttachment,
        refId: attachment.refId,
        refTypeIdentifier: type.identifier,
        change: { attachments: [attachment] },
        description: attachment.description || attachment.name,
        confidential: false,
      },
      trx,
    );
    return attachment;
  });
}
