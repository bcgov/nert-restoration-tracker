import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/custom-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('Repositories/ProjectParticipationRepository');

export interface IProjectParticipation {
  project_participation_id: number;
  project_id: number;
  system_user_id: number;
  project_role_id: number;
  project_role_name: string;
}

/**
 * A repository class for accessing project participants data.
 *
 * @export
 * @class ProjectParticipationRepository
 * @extends {BaseRepository}
 */
export class ProjectParticipationRepository extends BaseRepository {
  /**
   * Ensure a project participation exists.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {Promise<boolean>}
   * @memberof ProjectParticipationRepository
   */
  async ensureProjectParticipation(projectId: number, systemUserId: number): Promise<boolean> {
    defaultLog.debug({ label: 'ensureProjectParticipation', message: 'params', projectId, systemUserId });

    try {
      const sqlStatement = SQL`
        SELECT
          *
        FROM
          project_participation
        WHERE
          project_id = ${projectId}
        AND
          system_user_id = ${systemUserId};
      `;

      const response = await this.connection.sql(sqlStatement);

      if (!response.rowCount) {
        return false;
      }

      return response.rowCount > 0;
    } catch (error) {
      defaultLog.debug({ label: 'ensureProjectParticipation', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get all project participants from all projects a user is associated with.
   *
   * @param {number} systemUserId
   * @return {*}
   * @memberof ProjectParticipationRepository
   */
  async getParticipantsFromAllSystemUsersProjects(systemUserId: number) {
    try {
      const sqlStatement = SQL`
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

      const response = await this.connection.sql(sqlStatement);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to get project participants', [
          'ProjectParticipationRepository->getParticipantsFromAllSystemUsersProjects',
          'rowCount was null or undefined, expected rowCount > 0'
        ]);
      }

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getParticipantsFromAllSystemUsersProjects', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get all projects from a user.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<IProjectParticipation[]>}
   * @memberof ProjectParticipationRepository
   */
  async getAllUserProjects(systemUserId: number): Promise<IProjectParticipation[]> {
    defaultLog.debug({ label: 'getAllUserProjects', message: 'params', systemUserId });

    try {
      const sqlStatement = SQL`
          SELECT
            project.project_id,
            project.name as project_name,
            project_participation.system_user_id,
            project_participation.project_role_id,
            project_role.name as project_role_name,
            project_participation.project_participation_id
          FROM
            project_participation
          LEFT JOIN
            project_role
          ON
            project_participation.project_role_id = project_role.project_role_id
          LEFT JOIN
            project
          ON
            project_participation.project_id = project.project_id
          WHERE
            project_participation.system_user_id = ${systemUserId};
        `;

      const response = await this.connection.sql(sqlStatement);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to get user projects', [
          'ProjectParticipationRepository->getAllUserProjects',
          'rowCount was null or undefined, expected rowCount > 0'
        ]);
      }

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getAllUserProjects', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get all project participants.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IProjectParticipation[]>}
   * @memberof ProjectParticipationRepository
   */
  async getAllProjectParticipants(projectId: number): Promise<IProjectParticipation[]> {
    defaultLog.debug({ label: 'getAllProjectParticipants', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        SELECT
            pp.project_participation_id,
            pp.project_id,
            pp.system_user_id,
            pp.project_role_id,
            pr.name project_role_name,
            su.user_identifier,
            su.user_identity_source_id
        FROM
            project_participation pp
        LEFT JOIN
            system_user su
        ON
            pp.system_user_id = su.system_user_id
        LEFT JOIN
            project_role pr
        ON
            pr.project_role_id = pp.project_role_id
        WHERE
            pp.project_id = ${projectId};
    `;

      const response = await this.connection.sql(sqlStatement);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to get project participants', [
          'ProjectParticipationRepository->getAllProjectParticipants',
          'rowCount was null or undefined, expected rowCount > 0'
        ]);
      }

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getAllProjectParticipants', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project participant.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {number} projectParticipantRoleId
   * @return {*}  {Promise<void>}
   * @memberof ProjectParticipationRepository
   */
  async insertProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    defaultLog.debug({
      label: 'insertProjectParticipant',
      message: 'params',
      projectId,
      systemUserId,
      projectParticipantRoleId
    });

    try {
      const sqlStatement = SQL`
            INSERT INTO project_participation (
                project_id,
                system_user_id,
                project_role_id
            ) VALUES (
                ${projectId},
                ${systemUserId},
                ${projectParticipantRoleId}
            );
        `;

      const response = await this.connection.sql(sqlStatement);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to insert project participant', [
          'ProjectParticipationRepository->insertProjectParticipant',
          'rowCount was null or undefined, expected rowCount > 0'
        ]);
      }
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectParticipant', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project participant by role name.
   *
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {string} projectParticipantRole
   * @return {*}
   * @memberof ProjectParticipationRepository
   */
  async insertProjectParticipantByRoleName(projectId: number, systemUserId: number, projectParticipantRole: string) {
    try {
      const sqlStatement = SQL`
      INSERT INTO project_participation (
        project_id,
        system_user_id,
        project_role_id
      )
      (
        SELECT
          ${projectId},
          ${systemUserId},
          project_role_id
        FROM
          project_role
        WHERE
          name = ${projectParticipantRole}
      )
      RETURNING
        *;
    `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project participant', [
          'ProjectRepository->insertProjectParticipantByRoleName',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectParticipantByRoleName', message: 'error', error });
      throw error;
    }
  }
}
