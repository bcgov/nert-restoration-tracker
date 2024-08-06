import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { geoJsonFeature } from '../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../services/project-service';
import { SearchService } from '../../../../services/search-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/projects/get');
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
  getUserProjectsList()
];

GET.apiDoc = {
  description: 'Gets a list of projects based on user Id.',
  tags: ['projects'],
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
                        required: ['authorization_ref', 'authorization_type', 'authorization_desc'],
                        type: 'object',
                        properties: {
                          authorization_ref: {
                            type: 'string'
                          },
                          authorization_type: {
                            type: 'string'
                          },
                          authorization_desc: {
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
                      type: 'number'
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
 * Get all projects that a user is a participant (member) of.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getUserProjectsList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const searchService = new SearchService(connection);

      const projectIdsResponse = await searchService.findProjectIdsByProjectParticipation(connection.systemUserId());

      const projectIds = projectIdsResponse.map((item) => item.project_id);

      const projectService = new ProjectService(connection);

      const projects = await projectService.getProjectsByIds(projectIds);

      await connection.commit();

      return res.status(200).json(projects);
    } catch (error) {
      defaultLog.error({ label: 'getAllUserProjects', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
