import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getAPIUserDBConnection, getDBConnection } from '../../database/db';
import { HTTP500 } from '../../errors/custom-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { CodeService } from '../../services/code-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/codes');

export const GET: Operation = [getAllCodes()];

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateCode()
];

GET.apiDoc = {
  description: 'Get all Codes.',
  tags: ['code'],
  responses: {
    200: {
      description: 'Code response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              partnership_types: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              partnerships: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    type_id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              authorization_type: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              branding: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    },
                    value: {
                      type: 'string'
                    }
                  }
                }
              },
              first_nations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              region: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              system_roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              project_roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              administrative_activity_status_type: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
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

POST.apiDoc = {
  description: 'Update code',
  tags: ['code', 'update'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Code update object.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            codeType: {
              type: 'string',
              enum: [
                'first_nations',
                'system_roles',
                'project_roles',
                'administrative_activity_status_type',
                'branding',
                'authorization_type',
                'partnership_type',
                'partnerships'
              ],
              description: 'The type of code to update.'
            },
            codeData: {
              type: 'object',
              description: 'The code to update.',
              properties: {
                id: {
                  type: 'number',
                  description: 'The code id.'
                },
                name: {
                  type: 'string',
                  description: 'The code name.'
                },
                value: {
                  type: 'string',
                  description: 'The code value.',
                  nullable: true
                },
                fs_id: {
                  type: 'number',
                  description: 'The code fs_id.',
                  nullable: true
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
      description: 'Code response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean'
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
 * Get all codes.
 *
 * @returns {RequestHandler}
 */
export function getAllCodes(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const codeService = new CodeService(connection);

      const allCodeSets = await codeService.getAllCodeSets();

      await connection.commit();

      if (!allCodeSets) {
        throw new HTTP500('Failed to fetch codes');
      }

      return res.status(200).json(allCodeSets);
    } catch (error) {
      defaultLog.error({ label: 'getAllCodes', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Update code
 *
 * @returns {RequestHandler}
 */
export function updateCode(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const { codeType, codeData } = req.body;
    try {
      await connection.open();

      const codeService = new CodeService(connection);

      const response = await codeService.updateCode(codeType, codeData);

      await connection.commit();

      if (!response) {
        throw new HTTP500('Failed to update code');
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      defaultLog.error({ label: 'updateCode', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
