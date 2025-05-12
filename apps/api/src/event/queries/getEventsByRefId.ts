import { applyConfidential } from '~/assignee/query';
import { Context } from '~/context';

import { Event } from '../event';

export async function getEventsByRefId(refId: string, ctx: Context) {
  const query = Event.query(ctx.db).where('event.refId', '=', refId);
  applyConfidential(query, 'event', ctx);
  const events = await query;
  return events.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
}
