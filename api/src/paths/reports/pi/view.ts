import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ReportService } from '../../../services/reports-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/reports/pi/view');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  viewPiReportApp()
];

GET.apiDoc = {
  description: 'Get app PI report data, for view-only purposes.',
  tags: ['report'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'startDate',
      schema: {
        type: 'string'
      },
      required: true
    },
    {
      in: 'query',
      name: 'endDate',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Application PI report data.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'App PI report get response array, for view purposes',
              type: 'object',
              required: ['user_name', 'project_id', 'project_name', 'date', 'operation', 'file_name', 'file_type'],
              properties: {
                user_name: {
                  description: 'System user name.',
                  type: 'string'
                },
                project_id: {
                  description: 'project or plan unique ID.',
                  type: 'number'
                },
                project_name: {
                  description: 'Project or Plan name.',
                  type: 'string'
                },
                is_project: {
                  description: 'Is a Project or a Plan.',
                  type: 'boolean',
                  nullable: true
                },
                date: {
                  description: 'The date of event.',
                  type: 'string'
                },
                operation: {
                  description: 'UPDATE or INSERT.',
                  type: 'string'
                },
                file_name: {
                  description: 'In case of upload the file name.',
                  type: 'string',
                  nullable: true
                },
                file_type: {
                  description: 'Thumbnail or Attachment.',
                  type: 'string',
                  nullable: true
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
 * Get PI report data.
 *
 * @returns {RequestHandler}
 */
export function viewPiReportApp(): RequestHandler {
  defaultLog.debug({ label: 'viewPiReportApp' });
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      const reportService = new ReportService(connection);
      const result = await reportService.getPIMgmtReport(req.query.startDate as string, req.query.endDate as string);
      await connection.commit();
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewPiReportApp', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
