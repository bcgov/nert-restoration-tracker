import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Insert new table for partnership types and partnerships.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};
  `);

  // Update role
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA};

    UPDATE restoration.project_role SET name='Lead Editor' WHERE project_role_id=1;
    UPDATE restoration.project_role SET name='Team Member Editor' WHERE project_role_id=2;
    DELETE FROM restoration.project_role WHERE project_role_id=3;
  `);

  // Update table views
  await knex.raw(`
    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};

    CREATE OR REPLACE VIEW project_role AS SELECT * FROM restoration.project_role;
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
