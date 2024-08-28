import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { UserService } from '../../../../../services/user-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/participants/{projectParticipationId}/delete');

export const DELETE: Operation = [
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
  deleteProjectParticipant()
];

DELETE.apiDoc = {
  description: 'Delete a project participant.',
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
  responses: {
    200: {
      description: 'Delete project participant OK'
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

export function deleteProjectParticipant(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'deleteProjectParticipant', message: 'params', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userService = new UserService(connection);

      await userService.handleDeleteProjectParticipant(
        Number(req.params.projectParticipationId),
        Number(req.params.projectId)
      );

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteProjectParticipant', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
