import { SQL, SQLStatement } from 'sql-template-strings';
import {
  PostFocusData,
  PostFundingSource,
  PostLocationData,
  PostProjectData,
  PostProjectObject,
  PostRestPlanData
} from '../../models/project-create';
import { getLogger } from '../../utils/logger';
import { queries } from '../queries';

const defaultLog = getLogger('queries/project/project-create-queries');

/**
 * SQL query to insert a project row.
 *
 * @param {(PostProjectData)} project
 * @returns {SQLStatement} sql query object
 */
export const postProjectSQL = (project: PostProjectData): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectSQL', message: 'params', PostProjectObject });

  if (!project) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
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
      ${project.name},
      ${project.brief_desc},
      ${project.is_project},
      ${project.state_code},
      ${project.start_date},
      ${project.end_date},
      ${project.actual_start_date},
      ${project.actual_end_date},
      ${project.is_healing_land},
      ${project.is_healing_people},
      ${project.is_land_initiative},
      ${project.is_cultural_initiative},
      ${project.people_involved}
    )
    RETURNING
      project_id as id;
  `;

  defaultLog.debug({
    label: 'postProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project row.
 *
 * @param {PostLocationData} locationData
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const postProjectBoundarySQL = (locationData: PostLocationData, projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectBoundarySQL',
    message: 'params',
    obj: {
      ...locationData,
      geometry: locationData?.geometry?.map((item: any) => {
        return { ...item, geometry: 'Too big to print' };
      })
    }
  });

  if (!locationData || !locationData.geometry.length || !projectId) {
    return null;
  }

  const componentName = 'Boundary';
  const componentTypeName = 'Boundary';

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_spatial_component (
      project_id,
      project_spatial_component_type_id,
      name,
      is_within_overlapping,
      number_sites,
      size_ha,
      geojson,
      geography
    ) VALUES (
      ${projectId},
      (SELECT project_spatial_component_type_id from project_spatial_component_type WHERE name = ${componentTypeName}),
      ${componentName},
      ${
        locationData.is_within_overlapping === 'false' ? 'N' : locationData.is_within_overlapping === 'true' ? 'Y' : 'D'
      },
      ${locationData.number_sites},
      ${locationData.size_ha},
      ${JSON.stringify(locationData.geometry)}
  `;

  const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(locationData.geometry);

  sqlStatement.append(SQL`
    ,public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(
  `);

  sqlStatement.append(geometryCollectionSQL);

  sqlStatement.append(SQL`
    , 4326)))
  `);

  sqlStatement.append(SQL`
    )
    RETURNING
      project_spatial_component_id as id;
  `);

  defaultLog.debug({
    label: 'postProjectBoundarySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a project row.
 *
 * @param {PostFocusData} focusData
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const postProjectFocusSQL = (focusData: PostFocusData, projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectFocusSQL',
    message: 'params',
    obj: { ...focusData }
  });

  if (!focusData || !focusData.focuses.length || !projectId) {
    return null;
  }

  let is_healing_land = false;
  let is_healing_people = false;
  let is_land_initiative = false;
  let is_cultural_initiative = false;
  focusData.focuses?.map((focus: number) => {
    switch (focus) {
      case 1:
        is_healing_land = true;
        break;
      case 2:
        is_healing_people = true;
        break;
      case 3:
        is_land_initiative = true;
        break;
      case 4:
        is_cultural_initiative = true;
        break;
    }
  }) || [];

  const sqlStatement: SQLStatement = SQL`
    UPDATE project 
    SET is_healing_land = ${is_healing_land},
        is_healing_people = ${is_healing_people},
        is_land_initiative = ${is_land_initiative},
        is_cultural_initiative = ${is_cultural_initiative},
        people_involved = ${focusData.people_involved}
    WHERE project_id = ${projectId}   
    RETURNING
      project_id as id;
  `;

  defaultLog.debug({
    label: 'postProjectFocusSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a project row.
 *
 * @param {PostRestPlanData} restPlanData
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const postProjectRestPlanSQL = (restPlanData: PostRestPlanData, projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectRestPlanSQL',
    message: 'params',
    obj: { ...restPlanData }
  });

  if (!restPlanData || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE project 
    SET is_project_part_public_plan = ${restPlanData.is_project_part_public_plan}
    WHERE project_id = ${projectId}   
    RETURNING
      project_id as id;
  `;

  defaultLog.debug({
    label: 'postProjectRestPlanSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project funding source row.
 *
 * @param {PostFundingSource} fundingSource
 * @returns {SQLStatement} sql query object
 */
export const postProjectFundingSourceSQL = (
  fundingSource: PostFundingSource,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectFundingSourceSQL', message: 'params', fundingSource, projectId });

  if (!fundingSource || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_funding_source (
        project_id,
        investment_action_category_id,
        funding_source_project_id,
        funding_amount,
        funding_start_date,
        funding_end_date
      ) VALUES (
        ${projectId},
        ${fundingSource.investment_action_category},
        ${fundingSource.agency_project_id},
        ${fundingSource.funding_amount},
        ${fundingSource.start_date},
        ${fundingSource.end_date}
      )
      RETURNING
        project_funding_source_id as id;
    `;

  defaultLog.debug({
    label: 'postProjectFundingSourceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project IUCN row.
 *
 * @param iucn3_id
 * @param project_id
 * @returns {SQLStatement} sql query object
 */
export const postProjectIUCNSQL = (iucn3_id: number | null, project_id: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectIUCNSQL',
    message: 'params',
    iucn3_id,
    project_id
  });

  if (!iucn3_id || !project_id) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_iucn_action_classification (
        iucn_conservation_action_level_3_subclassification_id,
        project_id
      ) VALUES (
        ${iucn3_id},
        ${project_id}
      )
      RETURNING
        project_iucn_action_classification_id as id;
    `;

  defaultLog.debug({
    label: 'postProjectIUCNSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a focal species row into the study_species table.
 *
 * @param {number} speciesId
 * @returns {SQLStatement} sql query object
 */
export const postProjectSpeciesSQL = (speciesId: number, projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectSpeciesSQL', message: 'params', speciesId, projectId });

  if (!speciesId || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_species (
      wldtaxonomic_units_id,
      project_id
    ) VALUES (
      ${speciesId},
      ${projectId}
    ) RETURNING project_species_id as id;
  `;

  defaultLog.debug({
    label: 'postProjectSpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
