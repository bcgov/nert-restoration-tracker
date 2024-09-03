import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { DraftRepository } from '../../../repositories/draft-repository';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/draft/{userId}/list');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getUserDraftsList()
];

GET.apiDoc = {
  description: 'Gets the list of users drafts.',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'userId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'User drafts list response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Draft Response Object',
              type: 'object',
              required: ['id', 'name'],
              properties: {
                id: {
                  type: 'number'
                },
                name: {
                  type: 'string'
                },
                is_project: {
                  type: 'boolean'
                }
              }
            }
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get all drafts that belong to a user.
 *
 * @returns {RequestHandler}
 */
export function getUserDraftsList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getUserDraftsList', message: 'params', req_params: req.params });

    if (!req.params.userId) {
      throw new HTTP400('Missing required path param `userId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const draftRepository = new DraftRepository(connection);

      const draftsListResponse = await draftRepository.getDraftList(Number(req.params.userId));

      if (!draftsListResponse) {
        throw new HTTP400('Failed to get user drafts list');
      }

      await connection.commit();

      return res.status(200).json(draftsListResponse);
    } catch (error) {
      defaultLog.error({ label: 'getUserDraftsList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
