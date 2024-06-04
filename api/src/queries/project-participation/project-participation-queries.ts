import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/permit/permit-create-queries');

/**
 * SQL query to get all projects from user Id.
 *
 * @param {userId} userId
 * @returns {SQLStatement} sql query object
 */
export const getParticipantsFromAllSystemUsersProjectsSQL = (systemUserId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getParticipantsFromAllSystemUsersProjectsSQL',
    message: 'params',
    systemUserId
  });

  if (!systemUserId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      pp.project_participation_id,
      pp.project_id,
      pp.system_user_id,
      pp.project_role_id,
      pr.name project_role_name
    FROM
      project_participation pp
    LEFT JOIN
      project p
    ON
      pp.project_id = p.project_id
    LEFT JOIN
      project_role pr
    ON
      pr.project_role_id = pp.project_role_id
    WHERE
      pp.project_id in (
        SELECT
          p.project_id
        FROM
          project_participation pp
        LEFT JOIN
          project p
        ON
          pp.project_id = p.project_id
        WHERE
          pp.system_user_id = ${systemUserId}
      );
  `;

  defaultLog.debug({
    label: 'getParticipantsFromAllSystemUsersProjectsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete a single project participation record.
 *
 * @param {number} projectParticipationId
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteProjectParticipationSQL = (projectParticipationId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteProjectParticipantSQL',
    message: 'params',
    projectParticipationId
  });

  if (!projectParticipationId) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      project_participation
    WHERE
      project_participation_id = ${projectParticipationId}
    RETURNING
      *;
  `;

  defaultLog.debug({
    label: 'deleteProjectParticipantSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
