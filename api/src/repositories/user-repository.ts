import SQL from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiExecuteSQLError } from '../errors/custom-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/user-repository');

export interface UserObject {
  system_user_id: number;
  user_identifier: string;
  user_guid: string;
  record_end_date: Date;
  identity_source: string;
  role_ids: number[];
  role_names: string[];
  display_name?: string;
  given_name?: string;
  family_name?: string;
  agency?: string;
  email?: string;
}

/**
 * A repository class for accessing user data.
 *
 * @export
 * @class UserRepository
 * @extends {BaseRepository}
 */
export class UserRepository extends BaseRepository {
  /**
   * Fetch a single system user by their user identifier and source.
   *
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @return {*}  {Promise<UserObject>}
   * @memberof UserRepository
   */
  async getUserByUserIdentifier(userIdentifier: string, identitySource: string): Promise<UserObject> {
    defaultLog.debug({ label: 'getUserByUserIdentifier', message: 'params', userIdentifier, identitySource });

    try {
      const sqlStatement = SQL`
        SELECT
            su.system_user_id,
            su.user_identifier,
            su.user_guid,
            su.record_end_date,
            uis.name AS identity_source,
            array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
            array_remove(array_agg(sr.name), NULL) AS role_names
        FROM
            system_user su
        LEFT JOIN
            system_user_role sur
        ON
            su.system_user_id = sur.system_user_id
        LEFT JOIN
            system_role sr
        ON
            sur.system_role_id = sr.system_role_id
        LEFT JOIN
            user_identity_source uis
        ON
            uis.user_identity_source_id = su.user_identity_source_id
        WHERE
            su.user_identifier = ${userIdentifier.toLowerCase()}
        AND
            uis.name = ${identitySource}
        GROUP BY
            su.system_user_id,
            su.record_end_date,
            su.user_identifier,
            su.user_guid,
            uis.name
        ;
        `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'getUserByUserIdentifier', message: 'error', error });
      throw error;
    }
  }

  /**
   * Fetch a single system user by their ID.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<UserObject>}
   * @memberof UserRepository
   */
  async getUserById(systemUserId: number): Promise<UserObject> {
    defaultLog.debug({ label: 'getUserById', message: 'params', systemUserId });

    try {
      const sqlStatement = SQL`
        SELECT
            su.system_user_id,
            su.user_identifier,
            su.user_guid,
            su.record_end_date,
            uis.name AS identity_source,
            array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
            array_remove(array_agg(sr.name), NULL) AS role_names
        FROM
            system_user su
        LEFT JOIN
            system_user_role sur
        ON
            su.system_user_id = sur.system_user_id
        LEFT JOIN
            system_role sr
        ON
            sur.system_role_id = sr.system_role_id
        LEFT JOIN
            user_identity_source uis
        ON
            uis.user_identity_source_id = su.user_identity_source_id
        WHERE
            su.system_user_id = ${systemUserId}
        AND
            su.record_end_date IS NULL
        GROUP BY
            su.system_user_id,
            su.record_end_date,
            su.user_identifier,
            su.user_guid,
            uis.name
        ;
        `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to get user by id', [
          'UserRepository->getUserById',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'getUserById', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get an existing system user by their GUID.
   *
   * @param {string} userGuid
   * @return {*}  {Promise<UserObject>}
   * @memberof UserRepository
   */
  async getUserByGuid(userGuid: string): Promise<UserObject> {
    defaultLog.debug({ label: 'getUserByGuid', message: 'params', userGuid });

    try {
      const sqlStatement = SQL`
        SELECT
            su.system_user_id,
            su.user_identifier,
            su.user_guid,
            su.record_end_date,
            uis.name AS identity_source,
            array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
            array_remove(array_agg(sr.name), NULL) AS role_names
        FROM
            system_user su
        LEFT JOIN
            system_user_role sur
        ON
            su.system_user_id = sur.system_user_id
        LEFT JOIN
            system_role sr
        ON
            sur.system_role_id = sr.system_role_id
        LEFT JOIN
            user_identity_source uis
        ON
            uis.user_identity_source_id = su.user_identity_source_id
        WHERE
            su.user_guid = ${userGuid}
        AND
            su.record_end_date IS NULL
        GROUP BY
            su.system_user_id,
            su.record_end_date,
            su.user_identifier,
            su.user_guid,
            uis.name
        ;
        `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'getUserByGuid', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get a list of all users.
   *
   * @return {*}  {Promise<UserObject[]>}
   * @memberof UserRepository
   */
  async getUserList(): Promise<UserObject[]> {
    defaultLog.debug({ label: 'getUserList' });

    try {
      const sqlStatement = SQL`
        SELECT
            su.system_user_id,
            su.user_guid,
            su.user_identifier,
            su.record_end_date,
            uis.name AS identity_source,
            array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
            array_remove(array_agg(sr.name), NULL) AS role_names
        FROM
            system_user su
        LEFT JOIN
            system_user_role sur
        ON
            su.system_user_id = sur.system_user_id
        LEFT JOIN
            system_role sr
        ON
            sur.system_role_id = sr.system_role_id
        LEFT JOIN
            user_identity_source uis
        ON
            su.user_identity_source_id = uis.user_identity_source_id
        WHERE
            su.record_end_date IS NULL AND uis.name not in (${SYSTEM_IDENTITY_SOURCE.DATABASE}, ${SYSTEM_IDENTITY_SOURCE.SYSTEM})
        GROUP BY
            su.system_user_id,
            su.user_guid,
            su.record_end_date,
            su.user_identifier,
            uis.name;
        `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getUserList', message: 'error', error });
      throw error;
    }
  }

  /**
   * Adds a new system user.
   *
   * @param {(string | null)} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @return {*}  {Promise<UserObject>}
   * @memberof UserRepository
   */
  async addSystemUser(userGuid: string | null, userIdentifier: string, identitySource: string): Promise<UserObject> {
    defaultLog.debug({ label: 'addSystemUser', message: 'params', userGuid, userIdentifier, identitySource });

    try {
      const sqlStatement = SQL`
        INSERT INTO
            system_user
        (
            user_guid,
            user_identity_source_id,
            user_identifier,
            record_effective_date
        )
        VALUES (
            ${userGuid ? userGuid.toLowerCase() : null},
            (
            SELECT
                user_identity_source_id
            FROM
                user_identity_source
            WHERE
                name = ${identitySource.toUpperCase()}
            ),
            ${userIdentifier.toLowerCase()},
            now()
        )
        RETURNING
            system_user_id,
            user_identity_source_id,
            user_identifier,
            record_effective_date,
            record_end_date;
        `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert new user', [
          'UserRepository->addSystemUser',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'addSystemUser', message: 'error', error });
      throw error;
    }
  }

  /**
   * Update a system user.
   *
   * @param {number} userId
   * @return {*}  {Promise<void>}
   * @memberof UserRepository
   */
  async deactivateSystemUser(userId: number): Promise<void> {
    defaultLog.debug({ label: 'deactivateSystemUser', message: 'params', userId });

    try {
      const sqlStatement = SQL`
        UPDATE
            system_user
        SET
            record_end_date = now()
        WHERE
            system_user_id = ${userId};
        `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to deactivate system user', [
          'UserRepository->deactivateSystemUser',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }
    } catch (error) {
      defaultLog.debug({ label: 'deactivateSystemUser', message: 'error', error });
      throw error;
    }
  }

  /**
   * Activate a system user.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<void>}
   * @memberof UserRepository
   */
  async activateSystemUser(systemUserId: number): Promise<void> {
    defaultLog.debug({ label: 'activateSystemUser', message: 'params', systemUserId });

    try {
      const sqlStatement = SQL`
        UPDATE
            system_user
        SET
            record_end_date = NULL
        WHERE
            system_user_id = ${systemUserId}
        AND
            record_end_date IS NOT NULL
        RETURNING
            *;
        `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to activate system user', [
          'UserRepository->activateSystemUser',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }
    } catch (error) {
      defaultLog.debug({ label: 'activateSystemUser', message: 'error', error });
      throw error;
    }
  }

  /**
   * Add one or more system roles to a user.
   *
   * @param {number} userId
   * @param {number[]} roleIds
   * @return {*}  {Promise<void>}
   * @memberof UserRepository
   */
  async postSystemRoles(userId: number, roleIds: number[]): Promise<void> {
    defaultLog.debug({ label: 'postSystemRoles', message: 'params', userId, roleIds });

    try {
      const sqlStatement = SQL`
        INSERT INTO
            system_user_role (
                system_user_id,
                system_role_id
            )
        VALUES
        `;

      roleIds.forEach((roleId, index) => {
        sqlStatement.append(SQL`
          (${userId},${roleId})
        `);

        if (index !== roleIds.length - 1) {
          sqlStatement.append(',');
        }
      });

      sqlStatement.append(';');

      const response = await this.connection.sql(sqlStatement);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to insert user system roles', [
          'UserRepository->postSystemRoles',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }
    } catch (error) {
      defaultLog.debug({ label: 'postSystemRoles', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete all system roles from user.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<void>}
   * @memberof UserRepository
   */
  async deleteUserSystemRoles(systemUserId: number): Promise<void> {
    defaultLog.debug({ label: 'deleteUserSystemRoles', message: 'params', systemUserId });

    try {
      const sqlStatement = SQL`
        DELETE FROM
            system_user_role
        WHERE
            system_user_id = ${systemUserId};
        `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteUserSystemRoles', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete all project roles from user.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<void>}
   * @memberof UserRepository
   */
  async deleteAllProjectRoles(systemUserId: number): Promise<void> {
    defaultLog.debug({ label: 'deleteAllProjectRoles', message: 'params', systemUserId });

    try {
      const sqlStatement = SQL`
        DELETE FROM
            project_participation
        WHERE
            system_user_id = ${systemUserId};
        `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteAllProjectRoles', message: 'error', error });
      throw error;
    }
  }
}
