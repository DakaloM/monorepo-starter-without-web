import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('cache', (t) => {
    t.string('key').primary();
    t.string('value').notNullable();
    t.bigInteger('expires_at').nullable();
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('cache');
}
