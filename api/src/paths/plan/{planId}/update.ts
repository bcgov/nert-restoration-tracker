import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { PostEditPlanObject } from '../../../models/project-create';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { PlanService } from '../../../services/plan-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/plan/{planId}/update');

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
          projectId: Number(req.params.planId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  updatePlan()
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
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.planId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  viewPlanForEdit()
];

PUT.apiDoc = {
  description: 'Update a plan.',
  tags: ['plan'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Plan put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Plan Put Object',
          required: ['project', 'focus', 'contact', 'location'],
          type: 'object',
          additionalProperties: false,
          properties: {
            project: {
              type: 'object',
              required: ['project_name', 'start_date', 'end_date'],
              properties: {
                project_name: {
                  type: 'string'
                },
                start_date: {
                  type: 'string',
                  oneOf: [{ format: 'date' }, { format: 'date-time' }],
                  description: 'ISO 8601 date string for the project start date'
                },
                end_date: {
                  oneOf: [
                    {
                      type: 'string',
                      anyOf: [{ format: 'date' }, { format: 'date-time' }],
                      description: 'ISO 8601 date string For the project end date',
                      nullable: true
                    },
                    {
                      type: 'string',
                      enum: ['']
                    }
                  ]
                },
                revision_count: {
                  type: 'number'
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
                        type: 'string',
                        nullable: true
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
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Plan with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Plan Response Object',
            type: 'object',
            required: ['project_id'],
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
  description: 'Get a project, for edit purposes.',
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
                  image_url: {
                    type: 'string'
                  },
                  image_key: {
                    type: 'string'
                  },
                  attachment_id: {
                    type: 'number'
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
export function updatePlan(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const planId = Number(req.params?.planId);

      const entities = new PostEditPlanObject(req.body);

      if (!planId) {
        throw new HTTP400('Missing required path parameter: planId');
      }

      await connection.open();

      const planService = new PlanService(connection);

      const response = await planService.updatePlan(planId, entities);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'updatePlan', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Get a plan by its id for edit.
 *
 * @returns {RequestHandler}
 */
export function viewPlanForEdit(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const planService = new PlanService(connection);

      const result = await planService.getPlanByIdForEdit(Number(req.params.planId));

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewPlanForEdit', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
