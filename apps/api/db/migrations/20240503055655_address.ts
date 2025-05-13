import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('address', (t) => {
    t.timestamps(true, true);
    t.uuid('id').primary();
    t.uuid('ref_id').notNullable();
    t.string('text').notNullable();
    t.float('lat').notNullable();
    t.float('lng').notNullable();
    t.string('suburb').notNullable();
    t.string('place_id');
    t.string('postal_code').notNullable();
    t.string('country').notNullable();
    t.string('province').notNullable();
    t.string('city').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('address');
}
