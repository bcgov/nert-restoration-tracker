import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../services/attachment-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/thumbnail/delete');

export const DELETE: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteThumbnail()
];

DELETE.apiDoc = {
  description: 'Delete a project thumbnail record.',
  tags: ['attachments', 'thumbnail'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'deleted thumbnail attachment',
      content: {
        'text/plain': {
          schema: {}
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

export function deleteThumbnail(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete thumbnail', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const projectId = Number(req.params.projectId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const existingThumbnails = await attachmentService.getAttachmentsByType(projectId, 'thumbnail');
      if (existingThumbnails.attachmentsList.length > 0) {
        await attachmentService.deleteAttachment(projectId, existingThumbnails.attachmentsList[0].id);
      }
      await connection.commit();

      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'deleteThumbnail', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
