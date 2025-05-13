import { NotFoundError } from '@repo/serverkit';
import { camelCase } from 'lodash';
import { Context } from '~/context';
import { Type, TypeIdentifier } from '~/type';

import { Assignee } from '../assignee';

export async function getAssigneeByRefId({ id, refType }: Args, ctx: Context) {
  const { db } = ctx;
  const type = await Type.query(db).findOne({ identifier: refType }).throwIfNotFound();

  const tableName = camelCase(type.identifier);
  const tableEntry = await db(tableName).where({ id });

  if (tableEntry.length === 0) {
    throw new NotFoundError({ message: 'Entry in ref table not found' });
  }

  const assignees = await Assignee.query(db).where({ refId: id, refTypeId: type.id });
  return assignees;
}

type Args = {
  id: string | number;
  refType: TypeIdentifier;
};
