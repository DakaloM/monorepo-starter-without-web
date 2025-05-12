import { createBuilder } from '@num/datakit';
import { faker } from '@num/testkit';

import * as argon from 'argon2';
import { Gender, IdentityType, Race, Title, User, UserRole, UserStatus } from '~/account/user';

export const userBuilder = createBuilder(
  async ({ password: pwd, ...attrs }: Partial<User>, _factory, ctx) => {
    const password = pwd ? await argon.hash(pwd) : undefined;
    const name = faker.person.firstName();
    const surname = faker.person.lastName();
    const sortName = `${name}${surname}`.toLowerCase();

    return User.fromJson({
      name,
      surname,
      sortName,
      role: faker.helpers.enumValue(UserRole),
      status: UserStatus.Active,
      email: faker.internet.email(),
      title: faker.helpers.enumValue(Title),
      gender: faker.helpers.enumValue(Gender),
      birthDate: faker.date.past({
        refDate: new Date(),
        years: 20,
      }),

      race: faker.helpers.enumValue(Race),
      idNumber: faker.string.alphanumeric(13),
      idType: faker.helpers.enumValue(IdentityType),
      password,
      ...attrs,
    });
  },
);
