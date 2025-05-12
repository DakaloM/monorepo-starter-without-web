import { Factory as BaseFactory, createFactory as createBaseFactory } from '@num/datakit';

import { userBuilder } from '~/account/builder';
import { assigneeBuilder, roleSeeds } from '~/assignee/builder';
import { clientBuilder } from '~/auth/builder';
import { Context } from '~/context';
import { attachmentBuilder } from '~/documents/builder';
import { eventsBuilder } from '~/event/builder';
import { typeSeeds } from '~/type/builder';

const builders = {
  attachment: attachmentBuilder,
  client: clientBuilder,
  user: userBuilder,
  assignee: assigneeBuilder,
  event: eventsBuilder,
};

const seeds = {
  types: typeSeeds,
  roles: roleSeeds,
};

export type Factory = BaseFactory<typeof builders, typeof seeds>;

export function createFactory(ctx: Context): Factory {
  return createBaseFactory(builders, seeds, ctx);
}
