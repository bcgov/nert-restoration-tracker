import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ReportService } from '../../../services/reports-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/reports/user/view');

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
  viewUserReportApp()
];

GET.apiDoc = {
  description: 'Get app user report data, for view-only purposes.',
  tags: ['report'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Application user report data.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'App user report get response array, for view purposes',
              type: 'object',
              required: [
                'user_id',
                'user_name',
                'role_names',
                'prj_count',
                'plan_count',
                'arch_prj_count',
                'arch_plan_count',
                'draft_prj_count',
                'draft_plan_count'
              ],
              properties: {
                user_id: {
                  description: 'System user unique identification number.',
                  type: 'number'
                },
                user_name: {
                  description: 'System user name.',
                  type: 'string'
                },
                role_names: {
                  description: 'System user roles.',
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                prj_count: {
                  description: 'Number of published projects.',
                  type: 'string'
                },
                plan_count: {
                  description: 'Number of published plans.',
                  type: 'string'
                },
                arch_prj_count: {
                  description: 'Number of archived projects.',
                  type: 'string'
                },
                arch_plan_count: {
                  description: 'Number of archived plans.',
                  type: 'string'
                },
                draft_prj_count: {
                  description: 'Number of project drafts.',
                  type: 'string'
                },
                draft_plan_count: {
                  description: 'Number of plan drafts.',
                  type: 'string'
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
 * Get stats for projects, plans and users.
 *
 * @returns {RequestHandler}
 */
export function viewUserReportApp(): RequestHandler {
  defaultLog.debug({ label: 'viewUserReportApp' });
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      const reportService = new ReportService(connection);
      const result = await reportService.getAppUserReport();
      await connection.commit();
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewUserReportApp', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
