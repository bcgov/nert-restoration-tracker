import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { models } from '../../../../models/models';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../services/project-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/projects/{projectId}/funding-sources/add');

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
  addFundingSource()
];

POST.apiDoc = {
  description: 'Add a funding source of a project.',
  tags: ['funding-sources'],
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
  requestBody: {
    description: 'Add funding source request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Project funding source post request object',
          type: 'object',
          required: ['agency_id', 'investment_action_category', 'funding_amount', 'start_date', 'end_date'],
          properties: {
            agency_id: {
              type: 'number'
            },
            investment_action_category: {
              type: 'number'
            },
            agency_project_id: {
              type: 'string'
            },
            funding_amount: {
              type: 'number'
            },
            start_date: {
              type: 'string',
              description: 'ISO 8601 date string'
            },
            end_date: {
              type: 'string',
              description: 'ISO 8601 date string'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'new project funding source id',
      content: {
        'application/json': {
          schema: {
            title: 'funding source id',
            type: 'object',
            required: ['id'],
            properties: {
              id: {
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

export function addFundingSource(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Add project funding source',
      message: 'params and body',
      'req.params': req.params,
      'req.body': req.body
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedPostFundingSource = req.body && new models.project.PostFundingSource(req.body);

    if (!sanitizedPostFundingSource) {
      throw new HTTP400('Missing funding source data');
    }

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const response = await projectService.insertFundingSource(
        sanitizedPostFundingSource,
        Number(req.params.projectId)
      );

      if (!response) {
        throw new HTTP400('Failed to insert project funding source data');
      }

      await connection.commit();

      return res.status(200).json({ id: response });
    } catch (error) {
      defaultLog.error({ label: 'addFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
