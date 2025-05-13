import { BaseModel } from '@repo/datakit';
import Objection from 'objection';
import { Context } from '~/context';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  NonBinary = 'NonBinary',
}

export enum Title {
  Mr = 'Mr',
  Ms = 'Ms',
  Mrs = 'Mrs',
  Miss = 'Miss',
  Dr = 'Dr',
  Prof = 'Prof',
  Rev = 'Rev',
  Other = 'Other',
  Advocate = 'Advocate',
}

export enum Race {
  African = 'African',
  Coloured = 'Coloured',
  Indian = 'Indian',
  White = 'White',
  Other = 'Other',
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  NotConfirmed = 'NotConfirmed',
  Suspended = 'Suspended',
  Deleted = 'Deleted',
}

export enum IdentityType {
  Citizen = 'Citizen',
  Passport = 'Passport',
}

export enum UserRole {
  User = 'User',
  Admin = 'Admin',
  Agent = 'Agent',
  SuperAdmin = 'SuperAdmin',
}

type Name = { name: string; surname: string };
export class User extends BaseModel {
  static tableName = 'user';

  id: string;
  sequence: number;
  role: UserRole;
  status: UserStatus;
  title: Title;
  name: string;
  surname: string;
  gender: Gender;
  race: Race;
  birthDate: Date;
  idNumber: string;
  idType: IdentityType;
  sortName: string;
  email: string;

  password?: string | null;

  static getName({ name, surname }: Name) {
    return `${name} ${surname}`;
  }

  static applySearch(
    query: Objection.QueryBuilder<User, User[]>,
    db: Context['db'],
    text?: string | null,
  ) {
    if (text) {
      const rank = `ts_rank(search, websearch_to_tsquery('simple', ?))`;
      query
        .select(db.raw(`*, ${rank} as rank`, text))
        .whereRaw(`search @@ websearch_to_tsquery('simple', ?)`, text)
        .andWhereRaw(`${rank} > 0`, text)
        .orderBy('rank', 'desc');
    } else {
      query.select('*');
    }
  }

  static getSortName(name: string, surname: string) {
    return User.getName({ name, surname }).toLowerCase().replace(/\s/g, '');
  }
}
