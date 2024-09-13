import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * fix project delete store procedure.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public;

    CREATE OR REPLACE PROCEDURE api_delete_project(p_project_id integer)
      LANGUAGE plpgsql
      SECURITY DEFINER
    AS $procedure$
    -- *******************************************************************
    -- Procedure: api_delete_project
    -- Purpose: deletes a project and dependencies
    --
    -- MODIFICATION HISTORY
    -- Person           Date        Comments
    -- ---------------- ----------- --------------------------------------
    -- charlie.garrettjones@quartech.com
    --                  2021-04-19  initial release
    --                  2021-06-21  added delete survey
    -- Kjartan.Einarsson@quartech.com
    --                  2022-02-25  added delete species
    -- Kjartan.Einarsson@quartech.com
    --                  2024-06-17 nert db release
    -- Oscar.Inostroza@quartech.com
    --                  2024-09-12 fixed delete project partnership
    -- *******************************************************************
    declare

    begin
      delete from project_partnership where project_id = p_project_id;
      delete from project_first_nation where project_id = p_project_id;
      delete from objective where project_id = p_project_id;
      delete from project_funding_source where project_id = p_project_id;
      delete from permit where project_id = p_project_id;
      delete from project_participation where project_id = p_project_id;
      delete from project_contact where project_id = p_project_id;
      delete from project_spatial_component where project_id = p_project_id;
      delete from project_species where project_id = p_project_id;
      delete from nrm_region where project_id = p_project_id;
      delete from conservation_area where project_id = p_project_id;
      delete from project_attachment where project_id = p_project_id;
      delete from project where project_id = p_project_id;

    exception
      when others THEN
        raise;
    end;
    $procedure$;
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
