import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../../database/db';
import { geoJsonFeature } from '../../../../openapi/schemas/geoJson';
import { ProjectService } from '../../../../services/project-service';
import { getLogger } from '../../../../utils/logger';
import { maskGateKeeper } from '../../../../utils/spatial-utils';

const defaultLog = getLogger('paths/public/project/{projectId}/view');

export const GET: Operation = [getPublicProjectForView()];

GET.apiDoc = {
  description: 'Get a public (published) project, for view-only purposes.',
  tags: ['project'],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Project get response object, for view purposes',
            type: 'object',
            required: ['project', 'authorization', 'contact', 'location', 'funding'],
            properties: {
              project: {
                description: 'Basic project metadata',
                type: 'object',
                required: ['project_id', 'project_name', 'start_date', 'end_date', 'brief_desc', 'publish_date'],
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
                          type: 'string',
                          nullable: true
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
                description: 'Project objectives',
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
 * Get a public (published) project by its id.
 *
 * @returns {RequestHandler}
 */
export function getPublicProjectForView(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const result = await projectService.getProjectById(Number(req.params.projectId), true);

      await connection.commit();

      // Mask private geometries
      const maskFilter = result.location.geometry?.map((feature) => {
        return maskGateKeeper(feature);
      });

      result.location.geometry = maskFilter;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
