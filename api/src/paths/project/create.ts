import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { PostProjectObject } from '../../models/project-create';
import { geoJsonFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/project/create');

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
  createProject()
];

POST.apiDoc = {
  description: 'Create a new Project.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Project post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Project post request object',
          type: 'object',
          required: [
            'project',
            'objective',
            'focus',
            'contact',
            'species',
            'iucn',
            'authorization',
            'funding',
            'partnership',
            'location',
            'restoration_plan'
          ],
          additionalProperties: false,
          properties: {
            project: {
              title: 'Project general information',
              type: 'object',
              properties: {
                project_name: {
                  type: 'string'
                },
                project_image: {
                  type: 'string',
                  nullable: true,
                  description: 'URL to the project image'
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
                  description: 'Workflow project or plan state'
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
                  description: 'Project or plan focused on healing the land'
                },
                is_healing_people: {
                  type: 'boolean',
                  description: 'Project or plan focused on healing the people'
                },
                is_land_initiative: {
                  type: 'boolean',
                  description: 'Project or plan focused on land based restoration initiative'
                },
                is_cultural_initiative: {
                  type: 'boolean',
                  description: 'Project or plan focused on cultural or community investment initiative'
                }
              }
            },
            objective: {
              title: 'Project objectives',
              type: 'object',
              additionalProperties: false,
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
            focus: {
              title: 'Project focuses',
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
            species: {
              title: 'Project species',
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
            iucn: {
              title: 'Project IUCN classifications',
              type: 'object',
              required: ['classificationDetails'],
              additionalProperties: false,
              properties: {
                classificationDetails: {
                  type: 'array',
                  items: {
                    title: 'IUCN classification',
                    type: 'object',
                    required: ['classification', 'subClassification1', 'subClassification2'],
                    properties: {
                      classification: {
                        type: 'number',
                        nullable: true
                      },
                      subClassification1: {
                        type: 'number',
                        nullable: true
                      },
                      subClassification2: {
                        type: 'number',
                        nullable: true
                      }
                    }
                  }
                }
              }
            },
            contact: {
              title: 'Project contact',
              type: 'object',
              required: ['contacts'],
              additionalProperties: false,
              properties: {
                contacts: {
                  type: 'array',
                  items: {
                    title: 'contacts',
                    type: 'object',
                    required: ['first_name', 'last_name', 'email_address', 'organization', 'is_public', 'is_primary'],
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
                      phone_number: {
                        type: 'string',
                        nullable: true
                      }
                    }
                  }
                }
              }
            },
            authorization: {
              title: 'Project authorizations',
              type: 'object',
              required: ['authorizations'],
              additionalProperties: false,
              properties: {
                authorizations: {
                  type: 'array',
                  required: ['authorization_ref', 'authorization_type'],
                  items: {
                    title: 'Project authorization',
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
              additionalProperties: false,
              properties: {
                fundingSources: {
                  type: 'array',
                  items: {
                    title: 'Project funding agency',
                    type: 'object',
                    required: ['agency_id', 'funding_amount', 'investment_action_category', 'start_date', 'end_date'],
                    properties: {
                      agency_id: {
                        type: 'number'
                      },
                      investment_action_category: {
                        type: 'number'
                      },
                      agency_project_id: {
                        type: 'string'
                      },
                      funding_amount: {
                        type: 'number'
                      },
                      start_date: {
                        type: 'string',
                        description: 'ISO 8601 date string'
                      },
                      end_date: {
                        type: 'string',
                        description: 'ISO 8601 date string'
                      }
                    }
                  }
                }
              }
            },
            partnership: {
              title: 'Project partnerships',
              type: 'object',
              additionalProperties: false,
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
                conservationAreas: {
                  type: 'array',
                  additionalProperties: true,
                  items: {
                    title: 'Project conservation areas',
                    type: 'object',
                    properties: {
                      conservationArea: {
                        type: 'string'
                      }
                    }
                  }
                },
                geometry: {
                  type: 'array',
                  items: {
                    ...(geoJsonFeature as object)
                  }
                },
                region: {
                  oneOf: [
                    {
                      type: 'string'
                    },
                    {
                      type: 'number'
                    }
                  ]
                }
              }
            },
            restoration_plan: {
              title: 'Project related to public plan',
              type: 'object',
              additionalProperties: false,
              properties: {
                is_project_part_public_plan: {
                  type: 'boolean'
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
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Project Response Object',
            type: 'object',
            required: ['id'],
            properties: {
              id: {
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
 * Creates a new project record.
 *
 * @returns {RequestHandler}
 */
export function createProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedProjectPostData = new PostProjectObject(req.body);
    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const projectId = await projectService.createProject(sanitizedProjectPostData);

      await connection.commit();

      return res.status(200).json({ id: projectId });
    } catch (error) {
      defaultLog.error({ label: 'createProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
