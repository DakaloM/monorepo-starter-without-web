import { BaseModel } from '@num/datakit';

export enum RoleIdentifier {
  Assignee = 'Assignee',
  Owner = 'Owner',
  ExternalOwner = 'ExternalOwner',
  ShopSteward = 'ShopSteward',
  RegionalOfficial = 'RegionalOfficial',
  Lawyer = 'Lawyer',
  Escalator = 'Escalator',
  Member = 'Member',
  Collaborator = 'Collaborator',
  Plaintiff = 'Plaintiff',
  Defendant = 'Defendant',
  MainPlaintiff = 'MainPlaintiff',
  MainDefendant = 'MainDefendant',
}

export class Role extends BaseModel {
  static tableName = 'role';

  id: string;
  name: string;
  identifier: RoleIdentifier;
}
