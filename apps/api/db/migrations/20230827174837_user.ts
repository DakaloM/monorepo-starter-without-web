import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('generate_ulid()'));
    t.string('name').notNullable();
    t.string('sort_name').notNullable();
    t.increments('sequence').notNullable().unique();
    t.string('surname').notNullable();
    t.string('title').notNullable();
    t.string('race').notNullable();
    t.string('gender').notNullable();
    t.date('birth_date').notNullable();
    t.string('id_type').notNullable();
    t.string('id_number').notNullable().unique();
    t.string('role').notNullable();
    t.string('password').nullable();
    t.string('status').notNullable();
    t.specificType('email', 'citext').notNullable().unique();
    t.timestamps(true, true);
  });

  await knex.raw(`
    ALTER TABLE "user"
    ADD COLUMN search tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('simple', coalesce(surname, '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(id_number, '')), 'C') ||
      setweight(to_tsvector('simple', coalesce(email, '')), 'D') :: tsvector
    ) STORED;
  `);

  await knex.raw(`
    CREATE INDEX user_search_idx ON "user" USING GIN(search);
  `);
}

export async function down(knex: Knex): Promise<void> {
  // drop the index
  await knex.raw(`
  DROP INDEX IF EXISTS user_search_idx;
  `);

  await knex.schema.dropTable('user');
}
