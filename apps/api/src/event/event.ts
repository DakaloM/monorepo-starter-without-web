import { BaseModel } from '@repo/datakit';
import { User } from '~/account/user';
import { Assignee } from '~/assignee';
import { TypeIdentifier } from '~/type/type';

export enum EventAction {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Escalate = 'Escalate',
  Assign = 'Assign',
  Attach = 'Attach',
  TrashAttachment = 'TrashAttachment',
  CreateTask = 'CreateTask',
}

export class Event<T> extends BaseModel {
  static tableName = 'event';
  static typeIdentifier = TypeIdentifier.Event;

  id: string;
  userId: string;
  refId: string;
  refTypeId: string;
  action: EventAction;
  description: string;
  confidential: boolean;
  assignees: Assignee[];
  change: Partial<T>;
  user: User;
  createdAt!: Date;

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.HasOneRelation,
        modelClass: User,
        join: {
          from: 'user.id',
          to: 'event.userId',
        },
      },
      assignees: {
        relation: BaseModel.HasManyRelation,
        modelClass: Assignee,
        join: {
          from: 'event.id',
          to: 'assignee.refId',
        },
      },
    };
  }
}
