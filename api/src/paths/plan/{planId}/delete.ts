import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { PlanService } from '../../../services/plan-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('/api/plan/{planId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.planId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deletePlan()
];

DELETE.apiDoc = {
  description: 'Delete a plan.',
  tags: ['plan'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'planId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Project delete response',
            type: 'boolean'
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

export function deletePlan(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete project', message: 'params', req_params: req.params });

    if (!req.params.planId) {
      throw new HTTP400('Missing required path param: `planId`');
    }

    const planId = Number(req.params.planId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const planService = new PlanService(connection);

      await planService.deletePlan(planId);

      await connection.commit();

      return res.status(200).json(true);
    } catch (error) {
      defaultLog.error({ label: 'deletePlan', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
