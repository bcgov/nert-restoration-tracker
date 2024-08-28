import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { PutProjectObject } from '../../../models/project-update';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectService } from '../../../services/project-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/update');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  updateProject()
];

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER],
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
  viewProjectForEdit()
];

PUT.apiDoc = {
  description: 'Update a project.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Project put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Project post request object',
          type: 'object',
          required: ['project', 'focus', 'contact', 'species', 'funding', 'location', 'restoration_plan'],
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
                  description: 'Project or plan focused on healing the land',
                  nullable: true
                },
                is_healing_people: {
                  type: 'boolean',
                  description: 'Project or plan focused on healing the people',
                  nullable: true
                },
                is_land_initiative: {
                  type: 'boolean',
                  description: 'Project or plan focused on land based restoration initiative',
                  nullable: true
                },
                is_cultural_initiative: {
                  type: 'boolean',
                  description: 'Project or plan focused on cultural or community investment initiative',
                  nullable: true
                }
              }
            },
            objective: {
              title: 'Project objectives',
              type: 'object',
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
                    type: 'object',
                    properties: {
                      tsn: {
                        type: 'number'
                      },
                      commonNames: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      },
                      scientificName: {
                        type: 'string'
                      },
                      rank: {
                        type: 'string'
                      },
                      kingdom: {
                        type: 'string'
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
                      },
                      authorization_desc: {
                        type: 'string',
                        nullable: true
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
              title: 'Project partnerships',
              type: 'object',
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
              properties: {
                is_within_overlapping: {
                  type: 'string'
                },
                size_ha: {
                  oneOf: [
                    {
                      type: 'string'
                    },
                    {
                      type: 'number'
                    }
                  ],
                  nullable: true
                },
                number_sites: {
                  type: 'number'
                },
                conservationAreas: {
                  type: 'array',
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
              properties: {
                is_project_part_public_plan: {
                  oneOf: [
                    {
                      type: 'string',
                      enum: ['true', 'false', 'dont_know']
                    },
                    {
                      type: 'boolean'
                    }
                  ]
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
      description: 'Project with matching projectId.',
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

GET.apiDoc = {
  description: 'Get a project, for edit-only purposes.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
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
            title: 'Project get response object, for edit purposes',
            type: 'object',
            required: ['project', 'species', 'authorization', 'contact', 'location', 'funding'],
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
                  image_url: {
                    type: 'string'
                  },
                  image_key: {
                    type: 'string'
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
                        partnership_type: {
                          type: 'string'
                        },
                        partnership_ref: {
                          type: 'string'
                        },
                        partnership_name: {
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
                required: [],
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
                    type: 'number',
                    nullable: true
                  },
                  conservationAreas: {
                    type: 'array',
                    items: {
                      title: 'Project conservation areas',
                      type: 'object',
                      properties: {
                        conservationArea: {
                          type: 'string'
                        }
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
 * Update a project.
 *
 * @returns {RequestHandler}
 */
export function updateProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params?.projectId);

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      const entities = new PutProjectObject(req.body);
      if (!entities) {
        throw new HTTP400('Missing required request body');
      }

      await connection.open();

      const projectService = new ProjectService(connection);

      await projectService.updateProject(projectId, entities);

      await connection.commit();

      return res.status(200).json({ id: projectId });
    } catch (error) {
      defaultLog.error({ label: 'updateProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Get a project by its id for edit.
 *
 * @returns {RequestHandler}
 */
export function viewProjectForEdit(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const result = await projectService.getProjectByIdForEdit(Number(req.params.projectId));

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
