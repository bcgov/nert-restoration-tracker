import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { DraftRepository } from '../../repositories/draft-repository';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/draft/index');

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
  getDraftList()
];

export const PUT: Operation = [
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
  updateDraft()
];

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

  createDraft()
];

GET.apiDoc = {
  description: 'Get all Drafts.',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Draft response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Draft Response Object',
              type: 'object',
              required: ['id', 'name'],
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

PUT.apiDoc = {
  description: 'Update a Draft.',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Draft put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Draft request object',
          type: 'object',
          required: ['name', 'data'],
          properties: {
            id: {
              title: 'Draft record ID',
              type: 'number'
            },
            name: {
              title: 'Draft name',
              type: 'string'
            },
            data: {
              title: 'Draft json data',
              type: 'object',
              properties: {}
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Draft Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Project postresponse object, for a given draft',
            type: 'object',
            properties: {
              id: {
                description: 'Project id',
                type: 'number'
              },
              date: {
                oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                description: 'The date this draft was last updated'
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
  description: 'Create a new Draft.',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Draft post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Draft request object',
          type: 'object',
          required: ['is_project', 'name', 'data'],
          properties: {
            is_project: {
              title: 'True is project, False is plan',
              type: 'boolean'
            },
            name: {
              title: 'Draft name',
              type: 'string'
            },
            data: {
              title: 'Draft json data',
              type: 'object',
              properties: {}
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Draft post response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Draft Response Object',
            type: 'object',
            required: ['id', 'date'],
            properties: {
              id: {
                type: 'number'
              },
              date: {
                oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                description: 'The date this draft was last updated or created'
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
 * Gets a list of existing draft records.
 *
 * @returns {RequestHandler}
 */
export function getDraftList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      const draftRepository = new DraftRepository(connection);

      const draftResult = await draftRepository.getDraftList(systemUserId);

      if (!draftResult) {
        throw new HTTP400('Failed to get drafts');
      }

      await connection.commit();

      return res.status(200).json(draftResult);
    } catch (error) {
      defaultLog.error({ label: 'getDraftsList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Creates a new draft record.
 *
 * @returns {RequestHandler}
 */
export function createDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const draftRepository = new DraftRepository(connection);

      const createDraftResponse = await draftRepository.createDraft(
        systemUserId,
        req.body.is_project,
        req.body.name,
        req.body.data
      );

      await connection.commit();

      const draftResult = createDraftResponse || null;

      if (!draftResult || !draftResult.id) {
        throw new HTTP400('Failed to save draft');
      }

      return res.status(200).json({ id: draftResult.id, date: draftResult.update_date || draftResult.create_date });
    } catch (error) {
      defaultLog.error({ label: 'createProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Updates an existing draft record.
 *
 * @returns {RequestHandler}
 */
export function updateDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      if (!req.body.id) {
        throw new HTTP400('Missing required param id');
      }

      if (!req.body.name) {
        throw new HTTP400('Missing required param name');
      }

      if (!req.body.data) {
        throw new HTTP400('Missing required param data');
      }

      await connection.open();

      const draftRepository = new DraftRepository(connection);

      const updateDraftResponse = await draftRepository.updateDraft(req.body.id, req.body.name, req.body.data);

      const draftResult = updateDraftResponse || null;

      if (!draftResult || !draftResult.id) {
        throw new HTTP400('Failed to update draft');
      }

      await connection.commit();

      return res.status(200).json({ id: draftResult.id, date: draftResult.update_date || draftResult.create_date });
    } catch (error) {
      defaultLog.error({ label: 'updateProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
