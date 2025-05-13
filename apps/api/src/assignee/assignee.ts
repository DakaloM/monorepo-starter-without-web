import { BaseModel } from '@num/datakit';
import { ObjectMap } from '@num/utils';

import { User } from '~/account';
import { Type, TypeIdentifier } from '~/type';

import { Role } from './role';

export class Assignee extends BaseModel {
  static tableName = 'assignee';
  static typeIdentifier = TypeIdentifier.Assignee;

  id: string;
  objectId: string;
  roleId: string;
  refId: string;
  refTypeId: string;
  role: Role;
  user: User | null;

  refType: Type;

  static get relationMappings() {
    return {
      role: {
        relation: BaseModel.HasOneRelation,
        modelClass: Role,
        join: {
          from: 'role.id',
          to: 'assignee.roleId',
        },
      },
      user: {
        relation: BaseModel.HasOneRelation,
        modelClass: User,
        join: {
          from: 'user.id',
          to: 'assignee.objectId',
        },
      },
      refType: {
        relation: BaseModel.HasOneRelation,
        modelClass: Type,
        join: {
          from: 'type.id',
          to: 'assignee.refTypeId',
        },
      },
    };
  }
}
