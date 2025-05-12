import { Knex } from 'knex';

export async function up(knex: Knex) {
  return Promise.all([
    knex.schema.raw(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "citext";
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";
      CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "btree_gist";
      CREATE EXTENSION IF NOT EXISTS "btree_gin";

    `),
  ]);
}

export async function down() {
  return Promise.all([]);
}
