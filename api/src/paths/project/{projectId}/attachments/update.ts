import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../services/attachment-service';
import { findFileInS3, generateS3FileKey, moveFileInS3 } from '../../../../utils/file-utils';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/update');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  updateAttachment()
];
POST.apiDoc = {
  description: 'Update a project-specific attachment.',
  tags: ['attachment'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    }
  ],
  requestBody: {
    description: 'Attachment update post request object.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['key', 'fileType'],
          properties: {
            key: {
              type: 'string'
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
      description: 'Attachment upload response.',
      content: {
        'application/json': {
          schema: {
            title: 'Attachment Response Object',
            type: 'object',
            required: ['id', 'revision_count'],
            properties: {
              id: {
                type: 'number'
              },
              revision_count: {
                type: 'number'
              }
            }
          }
        }
      }
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
 * Updates an attachment for a project.
 *
 * @returns {RequestHandler}
 */
export function updateAttachment(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing projectId');
    }

    if (!req.body) {
      throw new HTTP400('Missing request body');
    }

    const projectId = Number(req.params.projectId);

    const fileType = req.body.fileType || 'attachments';

    const connection = getDBConnection(req['keycloak_token']);

    defaultLog.debug({
      label: 'uploadMedia',
      message: 'file'
    });

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const s3File = await findFileInS3(req.body.key);

      if (!s3File) {
        throw new HTTP400('Error fetching file from S3');
      }

      const s3Key = generateS3FileKey({
        projectId: projectId,
        fileName: 'thumbnail',
        fileType: fileType
      });

      const uploadResponse = await attachmentService.insertProjectAttachment(
        projectId,
        s3Key,
        s3File.Metadata?.filename || 'thumbnail',
        s3File.ContentLength || 0,
        fileType
      );

      await moveFileInS3(req.body.key, s3Key);

      await connection.commit();

      return res.status(200).json(uploadResponse);
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
