import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { geoJsonFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { PlanService } from '../../services/plan-service';
import { ProjectSearchCriteria, SearchService } from '../../services/search-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/plan/list');

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
  getPlansList()
];

GET.apiDoc = {
  description: 'Gets a list of plans and plans based on search parameters if passed in.',
  tags: ['plans'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Project Plans response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Project get response object, for view purposes',
              type: 'object',
              required: ['project', 'contact', 'location'],
              properties: {
                project: {
                  description: 'Basic plan metadata',
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
                      description: 'ISO 8601 date string for the plan start date',
                      nullable: true
                    },
                    end_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      description: 'ISO 8601 date string for the plan end date',
                      nullable: true
                    },
                    objectives: {
                      type: 'string'
                    },
                    publish_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      description: 'Status of the plan being published/unpublished',
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
                      nullable: true,
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
                          phone_number: {
                            type: 'string'
                          },
                          is_public: {
                            type: 'string',
                            enum: ['true', 'false']
                          },
                          is_first_nation: {
                            type: 'boolean'
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
                  description: 'The plan location object',
                  type: 'object',
                  required: ['geometry', 'region'],
                  properties: {
                    geometry: {
                      type: 'array',
                      items: {
                        ...(geoJsonFeature as object)
                      }
                    },
                    region: {
                      type: 'number',
                      nullable: true
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
 * Get all plans (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getPlansList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getPlansList' });
    const connection = getDBConnection(req['keycloak_token']);

    const searchCriteria: ProjectSearchCriteria = req.query || {};

    try {
      await connection.open();

      const searchService = new SearchService(connection);

      // Fetch all planIds that match the search criteria
      const planIdsResponse = await searchService.findProjectIdsByCriteria(searchCriteria);

      const planIds = planIdsResponse.map((item) => item.project_id);

      const planService = new PlanService(connection);

      // Get all plans data for the planIds
      const plans = await planService.getPlansByIds(planIds);

      await connection.commit();

      return res.status(200).json(plans);
    } catch (error) {
      defaultLog.error({ label: 'getPlansList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
