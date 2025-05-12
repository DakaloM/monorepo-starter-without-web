import { Knex } from 'knex';
import { types } from '~/seeds';

export async function seed(knex: Knex): Promise<void> {
  await knex('type').insert(types).onConflict('identifier').ignore();
}
