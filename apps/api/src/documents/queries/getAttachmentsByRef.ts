import { applyConfidential } from '~/assignee/query';
import { Context } from '~/context';

import { Attachment, AttachmentState } from '../attachment';

export type Args = {
  refId: string;
  refTypeId: string;
};

/**
 * Returns a paginated list of attachments for a given ref.
 */
export async function getAttachmentsByRef(args: Args, ctx: Context): Promise<Attachment[]> {
  const query = Attachment.query(ctx.db)
    .distinct('attachment.id')
    .select('attachment.*')
    .where('attachment.refId', '=', args.refId)
    .where('attachment.refTypeId', '=', args.refTypeId)
    // .where('attachment.state', '=', AttachmentState.COMPLETED)
    .whereNull('attachment.deletedAt');

  applyConfidential(query, 'attachment', ctx);

  const attachments = await query;

  return attachments;
}
