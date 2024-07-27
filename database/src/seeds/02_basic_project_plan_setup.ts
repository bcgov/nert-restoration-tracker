// import { faker } from '@faker-js/faker';
import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

const NUM_SEED_PROJECTS = Number(process.env.NUM_SEED_PROJECTS ?? 2);
const NUM_SEED_PLANS = Number(process.env.NUM_SEED_PLANS ?? 2);

const PROJECT_SEEDER_USER_IDENTIFIER = process.env.PROJECT_SEEDER_USER_IDENTIFIER || 'postgres';

/**
 * Add spatial transform
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH=${DB_SCHEMA},${DB_SCHEMA_DAPI_V1};
  `);

  const userData = await knex.raw(getInsertUserInfo(PROJECT_SEEDER_USER_IDENTIFIER));
  const userId = userData.rows[0].system_user_id;

  // Check if at least 1 project already exists
  const checkProjectsResponse = await knex.raw(checkAnyProjectExists());

  if (!checkProjectsResponse.rows.length) {
    for (let i = 0; i < NUM_SEED_PROJECTS; i++) {
      // Insert project data
      const createProjectResponse = await knex.raw(insertProjectData(`Seed Project ${i + 1}`, true));
      const projectId = createProjectResponse.rows[0].project_id;

      await knex.raw(`
        ${insertProjectParticipationData(projectId, userId)}
        ${insertProjectContactData(projectId)}
        ${insertProjectSpatialData(projectId)}
        ${insertProjectNRMRegionData(projectId)}
        ${insertProjectObjectiveData(projectId)}
      `);
    }
  }

  //check if at least 1 plan already exists
  const checkPlansResponse = await knex.raw(checkAnyPlanExists());

  if (!checkPlansResponse.rows.length) {
    for (let i = 0; i < NUM_SEED_PLANS; i++) {
      //     // Insert plan data
      const createPlanResponse = await knex.raw(insertProjectData(`Seed Plan ${i + 1}`, false));
      const planId = createPlanResponse.rows[0].project_id;

      await knex.raw(`
        ${insertProjectParticipationData(planId, userId)}
        ${insertProjectContactData(planId)}
        ${insertProjectSpatialData(planId)}
        ${insertProjectNRMRegionData(planId)}
      `);
    }
  }
}

const checkAnyPlanExists = () => `
  SELECT
    project_id
  FROM
    project
  WHERE
    is_project = false
  ;
`;

const checkAnyProjectExists = () => `
  SELECT
    project_id
  FROM
    project
  WHERE
    is_project = true;
`;

const getInsertUserInfo = (userIdentifier: string) => `
  SELECT
    system_user_id
  FROM
    system_user
  WHERE
    user_identifier = '${userIdentifier}'
  ;
`;

const insertProjectParticipationData = (projectId: number, systemUserId: number) => `
  INSERT INTO project_participation (
    project_id,
    system_user_id,
    project_role_id
  ) VALUES (
    ${projectId},
    ${systemUserId},
    1
  );
`;

const insertProjectNRMRegionData = (projectId: number) => `
INSERT INTO nrm_region (
  project_id,
  objectid,
  name
) VALUES (
  ${projectId},
  3640,
  3640
)
RETURNING
  nrm_region_id;
`;

const insertProjectSpatialData = (projectId: number) => `
  INSERT INTO project_spatial_component (
    project_id,
    project_spatial_component_type_id,
    name,
    is_within_overlapping,
    number_sites,
    size_ha,
    geography,
    geojson
  ) VALUES (
    ${projectId},
    (SELECT project_spatial_component_type_id from project_spatial_component_type WHERE name = 'Boundary'),
    'Boundary',
    'N',
    1,
    100,
    'POLYGON ((-121.904297 50.930738, -121.904297 51.971346, -120.19043 51.971346, -120.19043 50.930738, -121.904297 50.930738))',
    '[
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -121.904297,
                50.930738
              ],
              [
                -121.904297,
                51.971346
              ],
              [
                -120.19043,
                51.971346
              ],
              [
                -120.19043,
                50.930738
              ],
              [
                -121.904297,
                50.930738
              ]
            ]
          ]
        },
        "properties": {}
      }
    ]'
  )
  RETURNING
  project_spatial_component_id
;`;

const insertProjectContactData = (projectId: number) => `
  INSERT INTO project_contact (
    project_id, contact_type_id, first_name, last_name, organization, email_address, phone_number, is_public, is_primary, is_first_nation
  ) VALUES (
    ${projectId}, 1, 'John', 'Doe', 'Ministry of Forests', 'john@email.com', '250-555-5555', 'Y', 'Y', false
  );
`;

const insertProjectObjectiveData = (projectId: number) => `
  INSERT INTO objective (
    project_id, objective
  ) VALUES (
    ${projectId}, $$${faker.lorem.sentences(3)}$$
  );
`;

const insertProjectData = (projectName: string, isProject: boolean) => `
  INSERT INTO project (
    name,
    brief_desc,
    is_project,
    state_code,
    start_date,
    end_date,
    actual_start_date,
    actual_end_date,
    is_healing_land,
    is_healing_people,
    is_land_initiative,
    is_cultural_initiative,
    people_involved
  ) VALUES (
    '${projectName}',
    $$${faker.lorem.sentences(2)}$$,
    ${isProject},
    1,
    $$${faker.date.between({ from: '2000-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' }).toISOString()}$$,
    $$${faker.date.between({ from: '2025-01-01T00:00:00-08:00', to: '2030-01-01T00:00:00-08:00' }).toISOString()}$$,
    $$${faker.date.between({ from: '2000-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' }).toISOString()}$$,
    $$${faker.date.between({ from: '2025-01-01T00:00:00-08:00', to: '2030-01-01T00:00:00-08:00' }).toISOString()}$$,
    true,
    true,
    true,
    true,
    10
  )
  RETURNING
    project_id;
`;
