import { Knex } from 'knex';
import { ClientScope } from '~/auth/client';

export async function seed(knex: Knex): Promise<void> {
  await knex('client')
    .insert({
      id: 'cf9ff656-49ed-449e-bbee-38fc846940f6',
      secret:
        '$argon2id$v=19$m=65536,t=3,p=4$Vj1gJPocUtglnYpyKe9VVw$LeDqVOSUKLtwUwnymG+cVOhErfcv8KG2BnSj71lpyfE',
      name: 'WEB',
      scope: [ClientScope.Auth],
    })
    .onConflict('id')
    .ignore();
}
