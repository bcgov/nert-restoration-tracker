import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { PostPlanObject } from '../../models/project-create';
import { geoJsonFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { PlanService } from '../../services/plan-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/plan/create');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  createPlan()
];

POST.apiDoc = {
  description: 'Create a new Plan.',
  tags: ['plan'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Plan post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Plan post request object',
          type: 'object',
          required: ['project', 'focus', 'contact', 'location'],
          additionalProperties: false,
          properties: {
            project: {
              title: 'Project general information',
              type: 'object',
              properties: {
                project_name: {
                  type: 'string'
                },
                is_project: {
                  type: 'boolean',
                  description: 'True is project, False is plan'
                },
                brief_desc: {
                  type: 'string'
                },
                state_code: {
                  type: 'number',
                  description: 'Workflow plan state'
                },
                start_date: {
                  type: 'string',
                  description: 'ISO 8601 date string',
                  nullable: true
                },
                end_date: {
                  type: 'string',
                  description: 'ISO 8601 date string',
                  nullable: true
                },
                actual_start_date: {
                  type: 'string',
                  description: 'ISO 8601 date string',
                  nullable: true
                },
                actual_end_date: {
                  type: 'string',
                  description: 'ISO 8601 date string',
                  nullable: true
                },
                is_healing_land: {
                  type: 'boolean',
                  description: 'Plan focused on healing the land'
                },
                is_healing_people: {
                  type: 'boolean',
                  description: 'Plan focused on healing the people'
                },
                is_land_initiative: {
                  type: 'boolean',
                  description: 'Plan focused on land based restoration initiative'
                },
                is_cultural_initiative: {
                  type: 'boolean',
                  description: 'Plan focused on cultural or community investment initiative'
                }
              }
            },
            focus: {
              title: 'Plan focuses',
              type: 'object',
              additionalProperties: false,
              properties: {
                focuses: {
                  type: 'array',
                  items: {
                    type: 'number'
                  }
                },
                people_involved: {
                  type: 'number',
                  description: 'Number of people involved in the project',
                  nullable: true
                }
              }
            },
            contact: {
              title: 'Plan contact',
              type: 'object',
              required: ['contacts'],
              additionalProperties: false,
              properties: {
                contacts: {
                  type: 'array',
                  items: {
                    title: 'contacts',
                    type: 'object',
                    required: ['first_name', 'last_name', 'email_address', 'agency', 'is_public', 'is_primary'],
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
                      agency: {
                        type: 'string'
                      },
                      is_public: {
                        type: 'string',
                        enum: ['true', 'false']
                      },
                      is_primary: {
                        type: 'string',
                        enum: ['true', 'false']
                      }
                    }
                  }
                }
              }
            },
            location: {
              title: 'Location',
              type: 'object',
              required: ['geometry', 'region', 'number_sites'],
              additionalProperties: false,
              properties: {
                is_within_overlapping: {
                  type: 'string',
                  enum: ['true', 'false', 'dont_know']
                },
                size_ha: {
                  type: 'number',
                  nullable: true
                },
                number_sites: {
                  type: 'number'
                },
                name_area_conservation_priority: {
                  type: 'array',
                  items: {
                    title: 'Cultural or conservation area name',
                    type: 'string'
                  }
                },
                geometry: {
                  type: 'array',
                  items: {
                    ...(geoJsonFeature as object)
                  }
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
  responses: {
    200: {
      description: 'Plan response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Plan Response Object',
            type: 'object',
            required: ['project_id'],
            properties: {
              project_id: {
                type: 'number'
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
 * Creates a new plan record.
 *
 * @returns {RequestHandler}
 */
export function createPlan(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    const sanitizedPlanPostData = new PostPlanObject(req.body);
    console.log('sanitizedPlanPostData', sanitizedPlanPostData);
    try {
      await connection.open();

      const planService = new PlanService(connection);

      const projectId = await planService.createPlan(sanitizedPlanPostData);

      await connection.commit();

      return res.status(200).json(projectId);
    } catch (error) {
      defaultLog.error({ label: 'createPlan', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
