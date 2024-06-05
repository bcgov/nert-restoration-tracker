import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../../services/project-service';
import { getLogger } from '../../../../../utils/logger';
import { deleteFundingSourceApiDocObject } from '../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/projects/{projectId}/funding-sources/{pfsId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.query.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteFundingSource()
];

DELETE.apiDoc = deleteFundingSourceApiDocObject(
  'Delete a funding source of a project.',
  'Row count of successfully deleted funding sources'
);

export function deleteFundingSource(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete project funding source', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.pfsId) {
      throw new HTTP400('Missing required path param `pfsId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const response = await projectService.deleteFundingSourceById(
        Number(req.params.projectId),
        Number(req.params.pfsId)
      );

      if (!response) {
        throw new HTTP400('Failed to delete project funding source');
      }

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'deleteFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
