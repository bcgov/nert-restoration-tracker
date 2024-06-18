import SQL from 'sql-template-strings';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/draft-repository');

export interface IProjectDraft {
  id: number;
  is_project: boolean;
  name: string;
}

export interface IGetProjectDraftResponse {
  id: number;
  is_project: boolean;
  name: string;
  data: any;
}

export interface ICreateDraftResponse {
  id: number;
  is_project: boolean;
  name: string;
  update_date: string;
  create_date: string;
}

/**
 * A repository class for accessing draft data
 *
 * @export
 * @class DraftRepository
 * @extends {BaseRepository}
 */
export class DraftRepository extends BaseRepository {
  /**
   * Get a draft by id
   *
   * @param {number} draftId
   * @return {*}
   * @memberof DraftRepository
   */
  async getDraft(draftId: number): Promise<IGetProjectDraftResponse> {
    defaultLog.debug({ label: 'getDraft', message: 'params', draftId });

    try {
      const query = SQL`
        SELECT
        webform_draft_id as id,
        is_project,
        name,
        data
        FROM
          webform_draft
          WHERE
          webform_draft_id = ${draftId};
          `;

      const response = await this.connection.sql(query);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'getDraft', message: 'error', error });
      throw error;
    }
  }
  /**
   * Get a list of drafts for a user
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<IProjectDraft[]>}
   * @memberof DraftRepository
   */
  async getDraftList(systemUserId: number): Promise<IProjectDraft[]> {
    defaultLog.debug({ label: 'getDraftList', message: 'params', systemUserId });

    try {
      const query = SQL`
        SELECT
          webform_draft_id as id,
          is_project,
          name
        FROM
          webform_draft
        WHERE
          system_user_id = ${systemUserId};
      `;

      const response = await this.connection.sql(query);

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getDraftList', message: 'error', error });
      throw error;
    }
  }

  /**
   * Create a new draft record
   *
   * @param {number} systemUserId
   * @param {boolean} isProject
   * @param {string} name
   * @param {*} data
   * @return {*}  {Promise<ICreateDraftResponse>}
   * @memberof DraftRepository
   */
  async createDraft(systemUserId: number, isProject: boolean, name: string, data: any): Promise<ICreateDraftResponse> {
    defaultLog.debug({ label: 'createDraft', message: 'params', systemUserId, isProject, name, data });

    try {
      const query = SQL`
        INSERT INTO webform_draft (
          system_user_id,
          is_project,
          name,
          data
        ) VALUES (
          ${systemUserId},
          ${isProject},
          ${name},
          ${data}
        )
        RETURNING webform_draft_id as id, is_project, name, update_date::timestamptz, create_date::timestamptz;
      `;

      const response = await this.connection.sql(query);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'createDraft', message: 'error', error });
      throw error;
    }
  }

  /**
   * Update an existing draft record
   *
   * @param {number} id
   * @param {string} name
   * @param {*} data
   * @return {*}  {Promise<ICreateDraftResponse>}
   * @memberof DraftRepository
   */
  async updateDraft(id: number, name: string, data: any): Promise<ICreateDraftResponse> {
    defaultLog.debug({ label: 'createDraft', message: 'params', id, name, data });

    try {
      const putDraftSQLStatement = SQL`
        UPDATE
          webform_draft
        SET
          name = ${name},
          data = ${data}
        WHERE
          webform_draft_id = ${id}
        RETURNING
          webform_draft_id as id,
          create_date::timestamptz,
          update_date::timestamptz;
      `;

      const response = await this.connection.sql(putDraftSQLStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'createDraft', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a draft by id
   *
   * @param {number} draftId
   * @return {*}  {Promise<void>}
   * @memberof DraftRepository
   */
  async deleteDraft(draftId: number): Promise<number | null> {
    defaultLog.debug({ label: 'deleteDraft', message: 'params', draftId });

    try {
      const deleteDraftSQLStatement = SQL`
        DELETE from webform_draft
        WHERE webform_draft_id = ${draftId};
      `;

      const response = await this.connection.sql(deleteDraftSQLStatement);

      return response.rowCount;
    } catch (error) {
      defaultLog.debug({ label: 'deleteDraft', message: 'error', error });
      throw error;
    }
  }
}
