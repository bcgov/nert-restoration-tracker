import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { models } from '../../../../models/models';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../services/project-service';
import { getLogger } from '../../../../utils/logger';
import { addFundingSourceApiDocObject } from '../../../../utils/shared-api-docs';

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

POST.apiDoc = addFundingSourceApiDocObject('Add a funding source of a project.', 'new project funding source id');

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

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'addFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
