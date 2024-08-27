import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { DraftRepository } from '../../../../repositories/draft-repository';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { generateDraftS3FileKey, getS3SignedURL, scanFileForVirus, uploadFileToS3 } from '../../../../utils/file-utils';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/upload');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER, SYSTEM_ROLE.PROJECT_CREATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  uploadDraftAttachment()
];
POST.apiDoc = {
  description: 'Upload a draft project-specific attachment.',
  tags: ['attachment', 'draft'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'draftId',
      required: true
    }
  ],
  requestBody: {
    description: 'Attachment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['media'],
          properties: {
            media: {
              type: 'string',
              format: 'binary'
            },
            fileType: {
              type: 'string',
              enum: ['attachments', 'thumbnail', 'draft']
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Attachment upload response.'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Uploads any media in the request to S3, adding their keys to the request.
 * Also adds the metadata to the project_attachment DB table
 * Does nothing if no media is present in the request.
 *
 *
 * @returns {RequestHandler}
 */
export function uploadDraftAttachment(): RequestHandler {
  return async (req, res) => {
    if (!req.params.draftId) {
      throw new HTTP400('Missing draftId');
    }
    if (!req.files || !req.files.length) {
      throw new HTTP400('Missing upload data');
    }
    if (!req.body) {
      throw new HTTP400('Missing request body');
    }

    const draftId = Number(req.params.draftId);
    const rawMediaFile: Express.Multer.File = req.files[0];
    const metadata = {
      filename: rawMediaFile.originalname,
      username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
      email: (req['auth_payload'] && req['auth_payload'].email) || ''
    };

    const connection = getDBConnection(req['keycloak_token']);

    if (!(await scanFileForVirus(rawMediaFile))) {
      throw new HTTP400('Malicious content detected, upload cancelled');
    }

    defaultLog.debug({
      label: 'uploadMedia',
      message: 'file',
      file: { ...rawMediaFile, buffer: 'Too big to print' }
    });

    try {
      await connection.open();

      const s3Key = generateDraftS3FileKey({
        projectId: draftId,
        fileName: rawMediaFile.originalname,
        fileType: 'thumbnail'
      });

      const draftRepository = new DraftRepository(connection);

      const draft = await draftRepository.getDraft(draftId);

      if (!draft) {
        throw new HTTP400('Draft not found');
      }

      await uploadFileToS3(rawMediaFile, s3Key, metadata);

      const s3Url = await getS3SignedURL(s3Key);
      const updatedDraft = {
        ...draft,
        data: { ...draft.data, project: { ...draft.data.project, image_url: s3Url, image_key: s3Key } }
      };

      await draftRepository.updateDraft(draftId, draft.name, updatedDraft.data);

      await connection.commit();

      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
