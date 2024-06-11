import SQL from 'sql-template-strings';
import { getKnexQueryBuilder } from '../database/db';
import { ApiExecuteSQLError } from '../errors/custom-error';
import { S3FileType } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

export interface IAttachmentData {
  file_name: string;
  file_type: string;
  create_user: number;
  create_date: string;
  update_date: string;
  file_size: string;
  uuid: string;
  title: string | null;
  description: string | null;
  key: string;
  revision_count: number;
}

export interface IProjectAttachment extends IAttachmentData {
  project_attachment_id: number;
}

const defaultLog = getLogger('repositories/attachment-repository');
/**
 * A repository class for accessing project attachment data
 *
 * @export
 * @class AttachmentRepository
 * @extends {BaseRepository}
 */
export class AttachmentRepository extends BaseRepository {
  /**
   * Get attachments for a single project by type (optional)
   *
   * @param {number} projectId
   * @param {(S3FileType | S3FileType[])} [attachmentType]
   * @return {*}  {Promise<IProjectAttachment[]>}
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentsByType(
    projectId: number,
    attachmentType?: S3FileType | S3FileType[]
  ): Promise<IProjectAttachment[]> {
    defaultLog.debug({ label: 'getProjectAttachments', message: 'params', projectId, attachmentType });

    try {
      const queryBuilder = getKnexQueryBuilder()
        .select(
          'project_attachment.project_attachment_id',
          'project_attachment.file_name',
          'project_attachment.update_date',
          'project_attachment.create_date',
          'project_attachment.file_size',
          'project_attachment.key'
        )
        .from('project_attachment')
        .where('project_attachment.project_id', projectId);

      if (attachmentType) {
        queryBuilder.and.whereIn(
          'project_attachment.file_type',
          (Array.isArray(attachmentType) && attachmentType) || [attachmentType]
        );
      }

      const response = await this.connection.knex(queryBuilder);

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getProjectAttachments', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get an attachment for a single project by project id and filename
   *
   * @param {number} projectId
   * @param {string} fileName
   * @return {*}  {Promise<IProjectAttachment>}
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentByFileName(projectId: number, fileName: string): Promise<IProjectAttachment> {
    defaultLog.debug({ label: 'getProjectAttachmentByFileName', message: 'params', projectId, fileName });

    try {
      const sqlStatement = SQL`
        SELECT
          project_attachment_id,
          file_name,
          update_date,
          create_date,
          file_size
        from
          project_attachment
        where
          project_id = ${projectId}
        and
          file_name = ${fileName};
      `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to get project attachment by filename', [
          'AttachmentRepository->getProjectAttachmentByFileName',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'getProjectAttachmentByFileName', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete an attachment from a project
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string }>}
   * @memberof AttachmentRepository
   */
  async deleteProjectAttachment(projectId: number, attachmentId: number): Promise<{ key: string }> {
    defaultLog.debug({ label: 'deleteProjectAttachment', message: 'params', projectId, attachmentId });

    try {
      const sqlStatement = SQL`
        DELETE
          from project_attachment
        WHERE
          project_id = ${projectId}
        and
          project_attachment_id = ${attachmentId}
        RETURNING
          key;
      `;
      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to delete attachment', [
          'AttachmentRepository->deleteProjectAttachment',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectAttachment', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a new attachment for a project
   *
   * @param {string} fileName
   * @param {number} fileSize
   * @param {number} projectId
   * @param {string} key
   * @param {string} fileType
   * @return {*}  {Promise<{ project_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async insertProjectAttachment(
    fileName: string,
    fileSize: number,
    projectId: number,
    key: string,
    fileType: string
  ): Promise<{ project_attachment_id: number; revision_count: number }> {
    defaultLog.debug({
      label: 'insertProjectAttachment',
      message: 'params',
      fileName,
      fileSize,
      projectId,
      key,
      fileType
    });

    try {
      const sqlStatement = SQL`
        INSERT INTO project_attachment (
            project_id,
            file_name,
            file_type,
            file_size,
            title,
            key
        ) VALUES (
            ${projectId},
            ${fileName},
            ${fileType},
            ${fileSize},
            ${fileName},
            ${key}
        )
        RETURNING
            project_attachment_id,
            revision_count;
        `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert attachment', [
          'AttachmentRepository->insertProjectAttachment',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectAttachment', message: 'error', error });
      throw error;
    }
  }

  /**
   * Update an attachment for a project
   *
   * @param {number} projectId
   * @param {string} fileName
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async updateProjectAttachment(projectId: number, fileName: string): Promise<{ id: number; revision_count: number }> {
    defaultLog.debug({ label: 'updateProjectAttachment', message: 'params', projectId, fileName });

    try {
      const sqlStatement = SQL`
        UPDATE project_attachment
        SET
          file_name = ${fileName}
        WHERE
          file_name = ${fileName}
        AND
          project_id = ${projectId}
        RETURNING
          project_attachment_id as id,
          revision_count;
      `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to update attachment', [
          'AttachmentRepository->updateProjectAttachment',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'updateProjectAttachment', message: 'error', error });
      throw error;
    }
  }
}
