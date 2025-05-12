import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('assignee', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('generate_ulid()'));
    t.uuid('object_id').notNullable();
    t.uuid('ref_id').notNullable();
    t.uuid('ref_type_id').references('id').inTable('type').notNullable();
    t.uuid('role_id').references('id').inTable('role').notNullable();
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('assignee');
}
