import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { geoJsonFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { ProjectSearchCriteria, SearchService } from '../../services/search-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/projects/list');

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
  getProjectsPlansList()
];

GET.apiDoc = {
  description: 'Gets a list of projects and plans based on search parameters if passed in.',
  tags: ['projects'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'keyword',
      schema: {
        type: 'string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'project_name',
      schema: {
        type: 'string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'status',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'region',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'focus',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'start_date',
      schema: {
        type: 'string',
        oneOf: [{ format: 'date' }, { format: 'date-time' }],
        description: 'ISO 8601 date string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'end_date',
      schema: {
        type: 'string',
        oneOf: [{ format: 'date' }, { format: 'date-time' }],
        description: 'ISO 8601 date string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'actual_start_date',
      schema: {
        type: 'string',
        oneOf: [{ format: 'date' }, { format: 'date-time' }],
        description: 'ISO 8601 date string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'actual_end_date',
      schema: {
        type: 'string',
        oneOf: [{ format: 'date' }, { format: 'date-time' }],
        description: 'ISO 8601 date string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'objectives',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'organizations',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'funding_sources',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'ha_to',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'ha_from',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'authorization',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
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
              required: ['project', 'species', 'authorization', 'contact', 'location', 'funding'],
              properties: {
                project: {
                  description: 'Basic project metadata',
                  type: 'object',
                  required: [
                    'project_id',
                    'project_name',
                    'start_date',
                    'end_date',
                    'actual_start_date',
                    'actual_end_date',
                    'publish_date'
                  ],
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
                    actual_start_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      description: 'ISO 8601 date string for the project actual start date',
                      nullable: true
                    },
                    actual_end_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      description: 'ISO 8601 date string for the project actual end date',
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
                species: {
                  description: 'The project species',
                  type: 'object',
                  required: ['focal_species'],
                  properties: {
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'number'
                      }
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
                authorization: {
                  type: 'object',
                  required: ['authorizations'],
                  properties: {
                    authorizations: {
                      type: 'array',
                      items: {
                        title: 'Project authorization',
                        required: ['authorization_ref', 'authorization_type'],
                        type: 'object',
                        properties: {
                          authorization_ref: {
                            type: 'string'
                          },
                          authorization_type: {
                            type: 'string'
                          }
                        }
                      }
                    }
                  }
                },
                funding: {
                  title: 'Project funding sources',
                  type: 'object',
                  required: ['fundingSources'],
                  properties: {
                    fundingSources: {
                      type: 'array',
                      items: {
                        title: 'Project funding organization',
                        type: 'object',
                        required: ['organization_name', 'funding_amount', 'is_public'],
                        properties: {
                          organization_name: {
                            type: 'string'
                          },
                          description: {
                            type: 'string',
                            nullable: true
                          },
                          funding_project_id: {
                            type: 'string'
                          },
                          funding_amount: {
                            type: 'number'
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
                          is_public: {
                            type: 'string',
                            enum: ['true', 'false']
                          }
                        }
                      }
                    }
                  }
                },
                partnership: {
                  description: 'Project partnerships',
                  type: 'object',
                  required: ['partnerships'],
                  properties: {
                    partnerships: {
                      type: 'array',
                      items: {
                        title: 'Project partnerships',
                        type: 'object',
                        properties: {
                          partnership: {
                            type: 'string'
                          }
                        }
                      }
                    }
                  }
                },
                objective: {
                  title: 'Project objectives',
                  type: 'object',
                  required: ['objectives'],
                  properties: {
                    objectives: {
                      type: 'array',
                      items: {
                        title: 'Project objectives',
                        type: 'object',
                        properties: {
                          objective: {
                            type: 'string'
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
 * Get all projects (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getProjectsPlansList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getProjectsPlansList' });
    const connection = getDBConnection(req['keycloak_token']);

    const searchCriteria: ProjectSearchCriteria = req.query || {};

    try {
      await connection.open();

      const searchService = new SearchService(connection);

      // Fetch all projectIds that match the search criteria
      const projectIdsResponse = await searchService.findProjectIdsByCriteria(searchCriteria);

      const projectIds = projectIdsResponse.map((item) => item.project_id);

      const projectService = new ProjectService(connection);

      // Get all projects data for the projectIds
      const projects = await projectService.getProjectsByIds(projectIds);

      await connection.commit();

      return res.status(200).json(projects);
    } catch (error) {
      defaultLog.error({ label: 'getProjectsPlansList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
