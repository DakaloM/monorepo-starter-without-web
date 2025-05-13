import { BaseModel } from '@repo/datakit';

export enum TypeIdentifier {
  Account = 'Account',
  Case = 'Case',
  Task = 'Task',
  Document = 'Document',
  Attachment = 'Attachment',
  User = 'User',
  Member = 'Member',
  Role = 'Role',
  Group = 'Group',
  Organisation = 'Organisation',
  Assignee = 'Assignee',
  Event = 'Event',
  Category = 'Category',
  Note = 'Note',
  Tag = 'Tag',
  FinancialTransaction = 'FinancialTransaction',
  Plaintiff = 'Plaintiff',
  Defendant = 'Defendant',
  Tenant = 'Tenant',
  Update = 'Update',
}

export class Type extends BaseModel {
  static tableName = 'type';

  id: string;
  identifier: TypeIdentifier;
}
