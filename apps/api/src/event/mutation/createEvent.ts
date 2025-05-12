import { ConflictError, NotFoundError } from '@num/serverkit';
import { createObjectMap } from '@num/utils';

import { Knex } from 'knex';
import { compact, uniq } from 'lodash';
import { Role, RoleIdentifier } from '~/account';
import { Assignee } from '~/assignee';
import { Context } from '~/context';
import { Type, TypeIdentifier } from '~/type';

import { EventAction, Event } from '../event';

export type BaseEventArgs<TEvent> = {
  refId: string;
  refTypeIdentifier: TypeIdentifier;
  action: EventAction;
  from?: Partial<TEvent>;
  change: Partial<TEvent>;
  description: string;
};

//Todo: Use appropriate type
type AssigneeInput = any;

export type ConfidentialEventArgs<TEvent> = BaseEventArgs<TEvent> & {
  confidential: true;
  assignees: AssigneeInput[];
};

export type NonConfidentialEventArgs<TEvent> = BaseEventArgs<TEvent> & {
  confidential: false;
};

export type EventArgs<TEvent> = BaseEventArgs<TEvent> & {
  confidential: boolean;
  assignees?: AssigneeInput[];
};

export async function createEvents<TEvent>(
  events: EventArgs<TEvent>[],
  ctx: Context,
  trx: Knex,
): Promise<Event<TEvent>[]> {
  events.forEach((event) => {
    if (!event.assignees?.length && event.confidential) {
      throw new ConflictError({ message: 'Confidential event cannot have empty assignees.' });
    }
  });
  const typesInput = events.map((event) => event.refTypeIdentifier);
  typesInput.push(TypeIdentifier.Event);
  const types = compact(await ctx.loaders.types.byIdentifier.loadMany(typesInput)) as Type[];

  const rolesInput = uniq(
    events.reduce((memo: RoleIdentifier[], { assignees = [] }) => {
      return memo.concat(assignees.map(({ role }) => role));
    }, []),
  );

  const roles = compact(await ctx.loaders.roles.byIdentifier.loadMany(rolesInput)) as Role[];

  const typeMap = createObjectMap(types, (type) => type.identifier);

  const roleMap = createObjectMap(roles, (role) => role.identifier);

  const userId = ctx.auth.user?.id as string;

  const data = events.map((event) => {
    const { refId, action, change } = event;
    const type = typeMap[event.refTypeIdentifier];

    if (!type) {
      throw new NotFoundError({ message: 'Type not found' });
    }

    return {
      userId,
      refId,
      refTypeId: type.id,
      action,
      change,
      description: event.description,
      confidential: event.confidential,
    };
  });

  return Event.query(trx).insertGraph(data);
}
