import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { DraftRepository } from '../../../repositories/draft-repository';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('/api/draft/{draftId}/delete');

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
  deleteDraft()
];

DELETE.apiDoc = {
  description: 'Delete a draft record.',
  tags: ['attachment'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'draftId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Row count of successfully deleted draft record',
      content: {
        'text/plain': {
          schema: {
            type: 'number'
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

export function deleteDraft(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete draft', message: 'params', req_params: req.params });

    if (!req.params.draftId) {
      throw new HTTP400('Missing required path param `draftId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const draftRepository = new DraftRepository(connection);

      const draftResponse = await draftRepository.deleteDraft(Number(req.params.draftId));

      await connection.commit();

      return res.status(200).json(draftResponse);
    } catch (error) {
      defaultLog.error({ label: 'deleteDraft', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
