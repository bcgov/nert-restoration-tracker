import { Metadata } from 'aws-sdk/clients/s3';
import { IDBConnection } from '../database/db';
import { GetAttachmentsData } from '../models/project-attachments';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { deleteFileFromS3, getS3SignedURL, S3FileType, uploadFileToS3 } from '../utils/file-utils';
import { DBService } from './service';

export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.attachmentRepository = new AttachmentRepository(connection);
  }

  /**
   * Insert a new attachment for a project
   *
   * @param {number} projectId
   * @param {string} s3Key
   * @param {Express.Multer.File} file
   * @param {S3FileType} attachmentType
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async insertProjectAttachment(
    projectId: number,
    s3Key: string,
    file: Express.Multer.File,
    attachmentType: S3FileType
  ): Promise<{ id: number; revision_count: number }> {
    const response = await this.attachmentRepository.insertProjectAttachment(
      file.originalname,
      file.size,
      projectId,
      s3Key,
      attachmentType
    );

    return { id: response.project_attachment_id, revision_count: response.revision_count };
  }

  /**
   * Update an attachment for a project
   *
   * @param {number} projectId
   * @param {Express.Multer.File} file
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async updateProjectAttachment(
    projectId: number,
    file: Express.Multer.File
  ): Promise<{ id: number; revision_count: number }> {
    const response = await this.attachmentRepository.updateProjectAttachment(projectId, file.originalname);

    return response;
  }

  /**
   * Check if a file with the same name already exists for a project
   *
   * @param {number} projectId
   * @param {Express.Multer.File} file
   * @return {*}  {Promise<boolean>}
   * @memberof AttachmentService
   */
  async fileWithSameNameExist(projectId: number, file: Express.Multer.File): Promise<boolean> {
    const response = await this.attachmentRepository.getProjectAttachmentByFileName(projectId, file.originalname);

    return response && !!response.project_attachment_id;
  }

  async uploadMedia(
    projectId: number,
    file: Express.Multer.File,
    s3Key: string,
    attachmentType: S3FileType,
    metadata: Metadata = {}
  ): Promise<{ id: number; revision_count: number }> {
    const response = (await this.fileWithSameNameExist(projectId, file))
      ? this.updateProjectAttachment(projectId, file)
      : this.insertProjectAttachment(projectId, s3Key, file, attachmentType);

    await uploadFileToS3(file, s3Key, metadata);

    return response;
  }

  /**
   * Get attachments for a single project by type (optional)
   *
   * @param {number} projectId
   * @param {(S3FileType | S3FileType[])} [attachmentType]
   * @return {*}  {Promise<GetAttachmentsData>}
   * @memberof AttachmentService
   */
  async getAttachmentsByType(
    projectId: number,
    attachmentType?: S3FileType | S3FileType[]
  ): Promise<GetAttachmentsData> {
    const response = await this.attachmentRepository.getProjectAttachmentsByType(projectId, attachmentType);

    const rawAttachmentsDataWithUrl = await Promise.all(
      response.map(async (item) => ({ ...item, url: await getS3SignedURL(item.key) }))
    );

    return new GetAttachmentsData(rawAttachmentsDataWithUrl);
  }

  /**
   * Delete an attachment for a project
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @memberof AttachmentService
   */
  async deleteAttachment(projectId: number, attachmentId: number) {
    const response = await this.attachmentRepository.deleteProjectAttachment(projectId, attachmentId);

    await deleteFileFromS3(response.key);
  }

  /**
   * Delete all attachments for a project by type
   *
   * @param {number} projectId
   * @param {S3FileType} attachmentType
   * @memberof AttachmentService
   */
  async deleteAttachmentsByType(projectId: number, attachmentType: S3FileType) {
    const response = await this.attachmentRepository.getProjectAttachmentsByType(projectId, attachmentType);

    for (const row of response) {
      await deleteFileFromS3(row.key);
      await this.deleteAttachment(projectId, row.project_attachment_id);
    }
  }

  /**
   * Delete all attachments for a project
   *
   * @param {number} projectId
   * @memberof AttachmentService
   */
  async deleteAllS3Attachments(projectId: number) {
    const response = await this.attachmentRepository.getProjectAttachmentsByType(projectId);

    for (const row of response) {
      await deleteFileFromS3(row.key);
    }
  }
}
