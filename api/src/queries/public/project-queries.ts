import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/public/project-queries');

/**
 * SQL query to get a single public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      project.project_id as id,
      project.name,
      project.objectives,
      project.start_date,
      project.end_date,
      project.coordinator_first_name,
      project.coordinator_last_name,
      project.coordinator_email_address,
      project.coordinator_agency_name,
      project.coordinator_public,
      project.publish_timestamp as publish_date
    from
      project
    where
      project.project_id = ${projectId}
    and project.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get permits associated to a public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectPermitsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectPermitsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      number,
      type
    FROM
      permit as per
    LEFT OUTER JOIN
      project as p
    ON
      per.project_id = p.project_id
    WHERE
      per.project_id = ${projectId}
    AND p.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getPublicProjectPermitsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get public (published) project location.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getLocationByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getLocationByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      psc.geojson as geometry,
      p.revision_count
    FROM
      project p
    LEFT OUTER JOIN
      project_spatial_component psc
    ON
      p.project_id = psc.project_id
    WHERE
      p.project_id = ${projectId}
    GROUP BY
      psc.geojson,
      p.revision_count;
  `;

  defaultLog.debug({
    label: 'getLocationByPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get IUCN action classifications for a public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIUCNActionClassificationByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getIUCNActionClassificationByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      ical1c.name as classification,
      ical2s.name as subClassification1,
      ical3s.name as subClassification2
    FROM
      project_iucn_action_classification as piac
    LEFT OUTER JOIN
      iucn_conservation_action_level_3_subclassification as ical3s
    ON
      piac.iucn_conservation_action_level_3_subclassification_id = ical3s.iucn_conservation_action_level_3_subclassification_id
    LEFT OUTER JOIN
      iucn_conservation_action_level_2_subclassification as ical2s
    ON
      ical3s.iucn_conservation_action_level_2_subclassification_id = ical2s.iucn_conservation_action_level_2_subclassification_id
    LEFT OUTER JOIN
      iucn_conservation_action_level_1_classification as ical1c
    ON
      ical2s.iucn_conservation_action_level_1_classification_id = ical1c.iucn_conservation_action_level_1_classification_id
    LEFT OUTER JOIN
      project as p
    ON
      piac.project_id = p.project_id
    WHERE
      piac.project_id = ${projectId}
    AND
      p.publish_timestamp is not null
    GROUP BY
      ical1c.name,
      ical2s.name,
      ical3s.name;
  `;

  defaultLog.debug({
    label: 'getIUCNActionClassificationByPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get funding source data for a public (published) project
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getFundingSourceByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getFundingSourceByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      pfs.project_funding_source_id as id,
      fs.funding_source_id as agency_id,
      pfs.funding_amount::numeric::int,
      pfs.funding_start_date as start_date,
      pfs.funding_end_date as end_date,
      iac.investment_action_category_id as investment_action_category,
      iac.name as investment_action_category_name,
      fs.name as agency_name,
      pfs.funding_source_project_id as agency_project_id,
      pfs.revision_count as revision_count
    FROM
      project_funding_source as pfs
    LEFT OUTER JOIN
      investment_action_category as iac
    ON
      pfs.investment_action_category_id = iac.investment_action_category_id
    LEFT OUTER JOIN
      funding_source as fs
    ON
      iac.funding_source_id = fs.funding_source_id
    LEFT OUTER JOIN
      project as p
    ON
      pfs.project_id = p.project_id
    WHERE
      pfs.project_id = ${projectId}
    AND
      p.publish_timestamp is not null
    GROUP BY
      pfs.project_funding_source_id,
      fs.funding_source_id,
      pfs.funding_source_project_id,
      pfs.funding_amount,
      pfs.funding_start_date,
      pfs.funding_end_date,
      iac.investment_action_category_id,
      iac.name,
      fs.name,
      pfs.revision_count
  `;

  defaultLog.debug({
    label: 'getFundingSourceByPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project indigenous partnerships for a public (published) project.
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIndigenousPartnershipsByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getIndigenousPartnershipsByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      fn.name
    FROM
      project_first_nation as pfn
    LEFT OUTER JOIN
      first_nations as fn
    ON
      pfn.first_nations_id = fn.first_nations_id
    LEFT OUTER JOIN
      project as p
    ON
      p.project_id = pfn.project_id
    WHERE
      pfn.project_id = ${projectId}
    AND
      p.publish_timestamp is not null
    GROUP BY
      fn.name;
  `;

  defaultLog.debug({
    label: 'getIndigenousPartnershipsByPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project stakeholder partnerships for a public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getStakeholderPartnershipsByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getStakeholderPartnershipsByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      sp.name
    FROM
      stakeholder_partnership as sp
    LEFT OUTER JOIN
      project as p
    ON
      p.project_id = sp.project_id
    WHERE
      sp.project_id = ${projectId}
    AND
      p.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getStakeholderPartnershipsByPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all public facing (published) projects.
 *
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectListSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectListSQL', message: 'params' });

  const sqlStatement = SQL`
    SELECT
      p.project_id as id,
      p.name,
      p.start_date,
      p.end_date,
      p.coordinator_agency_name,
      string_agg(DISTINCT pp.number, ', ') as permits_list
    from
      project as p
    left outer join permit as pp
      on p.project_id = pp.project_id
    where
      p.publish_timestamp is not null
  `;

  sqlStatement.append(SQL`
    group by
      p.project_id,
      p.name,
      p.start_date,
      p.end_date,
      p.coordinator_agency_name
  `);

  defaultLog.debug({
    label: 'getPublicProjectListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get attachments for a single public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectAttachmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectAttachmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      pa.project_attachment_id as id,
      pa.file_name,
      pa.update_date,
      pa.create_date,
      pa.file_size,
      CASE WHEN api_security_check(pa.security_token,pa.create_user) THEN false ELSE true END as is_secured
    from
      project_attachment as pa
    left outer join
      project as p
    on
      p.project_id = pa.project_id
    where
      pa.project_id = ${projectId}
    and
      p.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getPublicProjectAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get S3 key of an attachment for a single public (published) project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectAttachmentS3KeySQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectAttachmentS3KeySQL', message: 'params', attachmentId });

  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      CASE WHEN api_security_check(security_token,create_user) THEN key ELSE null
      END as key
    FROM
      project_attachment
    WHERE
      project_id = ${projectId}
    AND
      project_attachment_id = ${attachmentId};
  `;

  defaultLog.debug({
    label: 'getPublicProjectAttachmentS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
