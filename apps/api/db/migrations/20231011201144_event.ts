import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('event', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('generate_ulid()'));
    t.uuid('user_id').references('id').inTable('user').notNullable();
    t.boolean('confidential').defaultTo(false);
    t.string('description').notNullable();
    t.uuid('ref_id').notNullable();
    t.uuid('ref_type_id').references('id').inTable('type').notNullable();
    t.string('action').notNullable();
    t.jsonb('change').notNullable();
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('event');
}
