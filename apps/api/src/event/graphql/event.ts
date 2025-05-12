import { builder } from '~/graphql/builder';

import { UserSchema } from '~/account/graphql';
import { getUserById } from '~/account/queries';
import { isActiveUser } from '~/account/shield';

import { Event, EventAction } from '../event';
import { getEventsByRefId } from '../queries';

export const EventActionSchema = builder.enumType(EventAction, {
  name: 'EventAction',
  description: 'Event action',
});

export const EventSchema = builder.objectType(Event, {
  name: 'Event',
  description: 'An event to an object.',
  shield: isActiveUser,
  fields: (t) => ({
    id: t.exposeID('id'),
    action: t.expose('action', {
      description: 'The action of the event.',
      nullable: false,
      type: EventActionSchema,
    }),
    change: t.expose('change', {
      description: 'The change value of the event.',
      nullable: false,
      type: 'JSON',
    }),
    description: t.exposeString('description', {
      description: 'The description of the event.',
    }),
    user: t.field({
      type: UserSchema,
      description: 'The user who triggered the event.',
      resolve: (root, _, ctx) => getUserById(root.userId, ctx),
    }),
    createdAt: t.expose('createdAt', {
      type: 'Date',
      description: 'The date the event was logged.',
      nullable: false,
    }),
  }),
});

builder.queryField('events', (t) =>
  t.field({
    type: [EventSchema],
    shield: isActiveUser,
    args: {
      refTypeId: t.arg.id({ required: true }),
    },
    resolve: async (_parent, args, ctx) => getEventsByRefId(args.refTypeId.toString(), ctx),
  }),
);

export const HasEventsSchema = builder.interfaceType('HasEvents', {
  description: 'The list of the events of the object.',
  fields: (t) => ({
    events: t.field({
      type: [EventSchema],
      args: {},
      description: 'The list of the events of the object.',
      resolve: async (root, _args, ctx) => {
        return await getEventsByRefId(root.id, ctx);
      },
    }),
  }),
});
