import { Knex } from 'knex';
import { roles } from '~/seeds';

export async function seed(knex: Knex): Promise<void> {
  await knex('role').insert(roles).onConflict('identifier').ignore();
}
