import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Update conservation area table, adding new column is_public.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  // Update conservation area table
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA};

    ALTER TABLE restoration.conservation_area ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

  `);

  // Update table views
  await knex.raw(`
    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};

    CREATE OR REPLACE VIEW conservation_area AS SELECT * FROM restoration.conservation_area;
  `);
}

/**
 * Not used.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
