import { Context } from '~/context';
import { applyPagination } from '~/domain/search';

import { Attachment } from '../attachment';

type AttachmentFilter = {
  limit?: number;
  page?: number;
};

export async function getAttachments(ctx: Context, search: AttachmentFilter = {}) {
  const query = Attachment.query(ctx.db);

  query
    .select('attachment.*')
    .distinctOn('attachment.id')
    .join('assignee', 'attachment.id', 'assignee.refId')
    .whereIn('assignee.objectId', ctx.auth.actorIds)
    .withGraphFetched('assignees.[user,tenant]');

  applyPagination(query, search);

  const attachments = await query;

  return attachments;
}
