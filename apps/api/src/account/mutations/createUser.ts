import { BadRequestError, ConflictError, NotFoundError } from '@repo/serverkit';
import { Knex } from 'knex';
import * as saIdParser from 'south-african-id-parser';
import { Context } from '~/context';
import { getMatchValues } from '~/domain/match';

import { Gender, IdentityType, Race, Title, User, UserRole, UserStatus } from '../user';

type CreateUserInput = {
  tenantId: string;
  email: string;
  idNumber: string;
  idType: IdentityType;
  name: string;
  surname: string;
  gender: Gender;
  race: Race;
  title: Title;
  birthDate: Date;
  role: UserRole;
};

export async function createUser(input: CreateUserInput, ctx: Context, trx?: Knex) {
  const db = trx || ctx.db;
  const { tenantId, email, idNumber, idType, name, surname, gender, race, title, birthDate } =
    input;

  const existingUser = await User.query(db).where({ email }).orWhere({ idNumber }).first();

  if (existingUser) {
    throw new ConflictError({
      message: 'User already exists',
      path: getMatchValues(existingUser, { idNumber, email }),
    });
  }

  if (idType === IdentityType.Citizen) {
    const parseInfo = saIdParser.parse(idNumber);
    if (!parseInfo.isValid) {
      throw new BadRequestError({ message: 'Invalid RSA ID Number' });
    }
  }

  const sortName = User.getSortName(input.name, input.surname);

  return User.query(db).insert({
    email,
    idNumber,
    idType,
    name,
    surname,
    gender,
    race,
    title,
    birthDate,
    sortName,
    role: input.role,
    status: UserStatus.Active,
  });
}
