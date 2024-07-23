-- api_delete_project.sql
drop procedure if exists api_delete_project;

create or replace procedure api_delete_project(p_project_id project.project_id%type)
language plpgsql
security definer
as
$$
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
-- *******************************************************************
declare

begin
  delete from partnership where project_id = p_project_id;
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
$$;
