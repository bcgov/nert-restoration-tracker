import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { PlanService } from '../../../services/plan-service';
import { getLogger } from '../../../utils/logger';
import { maskGateKeeper } from '../../../utils/spatial-utils';

const defaultLog = getLogger('paths/plan/{projectId}/view');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  viewPlan()
];

GET.apiDoc = {
  description: 'Get a project, for view-only purposes.',
  tags: ['project'],
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
      description: 'Plan with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Plan get response object, for view purposes',
            type: 'object',
            required: ['project', 'contact', 'location'],
            properties: {
              project: {
                description: 'Basic project metadata',
                type: 'object',
                required: ['project_id', 'project_name', 'start_date', 'end_date', 'publish_date'],
                properties: {
                  id: {
                    description: 'Project id',
                    type: 'number'
                  },
                  project_name: {
                    type: 'string'
                  },
                  start_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the project start date',
                    nullable: true
                  },
                  end_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the project end date',
                    nullable: true
                  },
                  brief_desc: {
                    type: 'string'
                  },
                  publish_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'Status of the project being published/unpublished',
                    nullable: true
                  },
                  revision_count: {
                    type: 'number'
                  }
                }
              },
              contact: {
                title: 'Project contact',
                type: 'object',
                required: ['contacts'],
                properties: {
                  contacts: {
                    type: 'array',
                    items: {
                      title: 'contacts',
                      type: 'object',
                      required: [
                        'first_name',
                        'last_name',
                        'email_address',
                        'organization',
                        'is_public',
                        'is_primary',
                        'is_first_nation'
                      ],
                      properties: {
                        first_name: {
                          type: 'string'
                        },
                        last_name: {
                          type: 'string'
                        },
                        email_address: {
                          type: 'string'
                        },
                        organization: {
                          type: 'string'
                        },
                        phone_number: {
                          type: 'string'
                        },
                        is_public: {
                          type: 'string',
                          enum: ['true', 'false']
                        },
                        is_primary: {
                          type: 'string',
                          enum: ['true', 'false']
                        },
                        is_first_nation: {
                          type: 'boolean'
                        }
                      }
                    }
                  }
                }
              },
              location: {
                description: 'The project location object',
                type: 'object',
                required: ['geometry', 'region'],
                properties: {
                  geometry: {
                    type: 'array',
                    items: {
                      ...(geoJsonFeature as object)
                    }
                  },
                  priority: {
                    type: 'string',
                    enum: ['true', 'false'],
                    nullable: true
                  },
                  region: {
                    type: 'number'
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
 * Get a plan by its id.
 *
 * @returns {RequestHandler}
 */
export function viewPlan(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const planService = new PlanService(connection);

      const result = await planService.getPlanById(Number(req.params.planId));

      await connection.commit();

      // Mask private geometries
      const maskFilter = result.location.geometry?.map((feature) => {
        return maskGateKeeper(feature);
      });

      result.location.geometry = maskFilter;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewPlan', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
