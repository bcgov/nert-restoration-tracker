import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import SQL from 'sql-template-strings';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/draft/{draftId}');

export const GET: Operation = [
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
  getSingleDraft()
];

GET.apiDoc = {
  description: 'Get a draft.',
  tags: ['draft'],
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
      description: 'Draft Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Draft Get Response Object',
            type: 'object',
            required: ['id', 'is_project', 'name', 'data'],
            properties: {
              id: {
                type: 'number'
              },
              is_project: {
                type: 'boolean'
              },
              name: {
                type: 'string',
                description: 'The name of the draft'
              },
              data: {
                type: 'object',
                description: 'The data associated with this draft',
                properties: {}
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
      $ref: '#/components/responses/401'
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
 * Get a draft by its id.
 *
 * @returns {RequestHandler}
 */
export function getSingleDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    try {
      const getDraftSQLStatement = SQL`
        SELECT
          webform_draft_id as id,
          is_project,
          name,
          data
        FROM
          webform_draft
        WHERE
          webform_draft_id = ${Number(req.params.draftId)};
      `;

      await connection.open();

      const draftResponse = await connection.query(getDraftSQLStatement.text, getDraftSQLStatement.values);

      await connection.commit();

      const draftResult = (draftResponse && draftResponse.rows && draftResponse.rows[0]) || null;

      return res.status(200).json(draftResult);
    } catch (error) {
      defaultLog.error({ label: 'getSingleDraft', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
