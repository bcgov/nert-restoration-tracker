import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ReportService } from '../../services/reports-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/reports/view');

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
  viewReportStats()
];

GET.apiDoc = {
  description: 'Get general app stats, for view-only purposes.',
  tags: ['report'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Application general stats.',
      content: {
        'application/json': {
          schema: {
            title: 'App stats get response object, for view purposes',
            type: 'object',
            required: ['project', 'plan', 'user', 'last_created'],
            properties: {
              project: {
                description: 'Basic project metadata',
                type: 'object',
                required: ['published_projects', 'draft_projects', 'archived_projects'],
                properties: {
                  published_projects: {
                    description: 'Number of published projects.',
                    type: 'number'
                  },
                  draft_projects: {
                    description: 'Number of project drafts.',
                    type: 'number'
                  },
                  archived_projects: {
                    description: 'Number of archived projects.',
                    type: 'number'
                  }
                }
              },
              plan: {
                description: 'Basic plan metadata',
                type: 'object',
                required: ['published_plans', 'draft_plans', 'archived_plans'],
                properties: {
                  published_plans: {
                    description: 'Number of published plans.',
                    type: 'number'
                  },
                  draft_plans: {
                    description: 'Number of plan drafts.',
                    type: 'number'
                  },
                  archived_plans: {
                    description: 'Number of archived plans.',
                    type: 'number'
                  }
                }
              },
              user: {
                description: 'Basic app user metadata',
                type: 'object',
                required: ['admins', 'maintainers', 'creators'],
                properties: {
                  admins: {
                    description: 'Number of administartors.',
                    type: 'number'
                  },
                  maintainers: {
                    description: 'Number of maintainers.',
                    type: 'number'
                  },
                  creators: {
                    description: 'Number of creators.',
                    type: 'number'
                  }
                }
              },
              last_created: {
                description: 'Last published project/plan',
                type: 'object',
                additionalProperties: false,
                required: ['project', 'plan'],
                properties: {
                  project: {
                    description: 'Last published project',
                    type: 'object',
                    required: ['id', 'name', 'datetime'],
                    additionalProperties: false,
                    properties: {
                      id: {
                        description: 'Unique project ID.',
                        type: 'number',
                        nullable: true
                      },
                      name: {
                        description: 'Project name.',
                        type: 'string',
                        nullable: true
                      },
                      datetime: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date-time' }],
                        description: 'ISO 8601 date string for the project start date time',
                        nullable: true
                      }
                    }
                  },
                  plan: {
                    description: 'Last published plan',
                    type: 'object',
                    required: ['id', 'name', 'datetime'],
                    additionalProperties: false,
                    properties: {
                      id: {
                        description: 'Unique plan ID.',
                        type: 'number',
                        nullable: true
                      },
                      name: {
                        description: 'Plan name.',
                        type: 'string',
                        nullable: true
                      },
                      datetime: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date-time' }],
                        description: 'ISO 8601 date string for the project start date time',
                        nullable: true
                      }
                    }
                  }
                }
              },
              last_updated: {
                description: 'Last updated project/plan',
                type: 'object',
                additionalProperties: false,
                required: ['project', 'plan'],
                properties: {
                  project: {
                    description: 'Last updated project',
                    type: 'object',
                    required: ['id', 'name', 'datetime'],
                    additionalProperties: false,
                    properties: {
                      id: {
                        description: 'Unique project ID.',
                        type: 'number',
                        nullable: true
                      },
                      name: {
                        description: 'Project name.',
                        type: 'string',
                        nullable: true
                      },
                      datetime: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date-time' }],
                        description: 'ISO 8601 date string',
                        nullable: true
                      }
                    }
                  },
                  plan: {
                    description: 'Last updated plan',
                    type: 'object',
                    required: ['id', 'name', 'datetime'],
                    additionalProperties: false,
                    properties: {
                      id: {
                        description: 'Unique plan ID.',
                        type: 'number',
                        nullable: true
                      },
                      name: {
                        description: 'Plan name.',
                        type: 'string',
                        nullable: true
                      },
                      datetime: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date-time' }],
                        description: 'ISO 8601 date string',
                        nullable: true
                      }
                    }
                  }
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
export function viewReportStats(): RequestHandler {
  defaultLog.debug({ label: 'viewReportStats' });
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      const reportService = new ReportService(connection);
      const result = await reportService.getAppStats();
      await connection.commit();
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewReportStats', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
