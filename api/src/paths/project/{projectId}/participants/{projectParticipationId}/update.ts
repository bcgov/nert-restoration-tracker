import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { UserService } from '../../../../../services/user-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/participants/{projectParticipationId}/update');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER],
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
  updateProjectParticipantRole()
];

PUT.apiDoc = {
  description: 'Update a project participant role.',
  tags: ['project'],
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
    },
    {
      in: 'path',
      name: 'projectParticipationId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['roleId'],
          properties: {
            roleId: {
              type: 'number'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update project participant role OK'
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

export function updateProjectParticipantRole(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'updateProjectParticipantRole', message: 'params', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userService = new UserService(connection);

      await userService.handleUpdateProjectParticipantRole(
        Number(req.params.projectParticipationId),
        Number(req.params.projectId),
        req.body.roleId
      );

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateProjectParticipantRole', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
