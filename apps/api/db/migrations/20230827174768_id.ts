import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION generate_ulid() RETURNS uuid
    AS $$
        SELECT (lpad(to_hex(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint), 12, '0') || encode(gen_random_bytes(10), 'hex'))::uuid;
    $$ LANGUAGE SQL;
    `);
}

export async function down(knex: Knex) {
  await knex.raw(`
    DROP FUNCTION IF EXISTS generate_ulid;
    `);
}
