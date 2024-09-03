import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { geoJsonFeature } from '../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { PlanService } from '../../../../services/plan-service';
import { SearchService } from '../../../../services/search-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/plans/list');
export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getUserPlansList()
];

GET.apiDoc = {
  description: 'Gets a list of plans based on user Id.',
  tags: ['plans'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'userId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Plan response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Plan get response object, for view purposes',
              type: 'object',
              required: ['project', 'contact', 'location'],
              properties: {
                project: {
                  description: 'Basic project metadata',
                  type: 'object',
                  required: ['project_id', 'project_name', 'start_date', 'end_date', 'publish_date'],
                  properties: {
                    project_id: {
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
                    objectives: {
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
                  type: 'object',
                  properties: {
                    contacts: {
                      type: 'array',
                      items: {
                        title: 'Project contact',
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
                  required: ['geometry'],
                  properties: {
                    geometry: {
                      type: 'array',
                      items: {
                        ...(geoJsonFeature as object)
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
 * Get all plans that a user is a participant (member) of.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getUserPlansList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const searchService = new SearchService(connection);

      const planIdsResponse = await searchService.findProjectIdsByPlanParticipation(connection.systemUserId());

      const planIds = planIdsResponse.map((item) => item.project_id);

      const planService = new PlanService(connection);

      const plans = await planService.getPlansByIds(planIds);

      await connection.commit();

      return res.status(200).json(plans);
    } catch (error) {
      defaultLog.error({ label: 'getAllUserProjects', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
