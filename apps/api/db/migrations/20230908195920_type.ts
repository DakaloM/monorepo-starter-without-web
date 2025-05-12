import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('type', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('generate_ulid()'));
    t.string('identifier').notNullable().unique();
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('type');
}
