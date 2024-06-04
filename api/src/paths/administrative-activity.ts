import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/custom-error';
import { hasPendingAdministrativeActivitiesResponseObject } from '../openapi/schemas/administrative-activity';
import { AdministrativeActivityService } from '../services/administrative-activity-service';
import { getUserIdentifier } from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/administrative-activity-request');

export const POST: Operation = [createAdministrativeActivity()];

export const GET: Operation = [getPendingAccessRequestsCount()];

POST.apiDoc = {
  description: 'Create a new Administrative Activity.',
  tags: ['admin'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Administrative Activity post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Administrative Activity request object',
          type: 'object',
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Administrative activity post response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Administrative Activity Response Object',
            type: 'object',
            required: ['id', 'date'],
            properties: {
              id: {
                type: 'number'
              },
              date: {
                oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                description: 'ISO 8601 date string for the project start date'
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
  description: 'Has one or more pending Administrative Activities.',
  tags: ['access request'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Administrative Activity get request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Administrative Activity request object',
          type: 'object',
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: '`Has Pending Administrative Activities` get response object.',
      content: {
        'application/json': {
          schema: {
            ...(hasPendingAdministrativeActivitiesResponseObject as object)
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
 * Creates a new access request record.
 *
 * @returns {RequestHandler}
 */
export function createAdministrativeActivity(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP500('Failed to identify system user ID');
      }

      const administrativeActivityService = new AdministrativeActivityService(connection);

      const accessRequestData = req?.body;
      const response = await administrativeActivityService.createPendingAccessRequest(systemUserId, accessRequestData);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'administrativeActivity', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Get all projects.
 *
 * @returns {RequestHandler}
 */
export function getPendingAccessRequestsCount(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const userIdentifier = getUserIdentifier(req['keycloak_token']);

      if (!userIdentifier) {
        throw new HTTP400('Missing required userIdentifier');
      }

      await connection.open();

      const administrativeActivityService = new AdministrativeActivityService(connection);

      const response = await administrativeActivityService.getAdministrativeActivityStanding(userIdentifier);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getPendingAccessRequestsCount', message: 'error', error });

      throw error;
    } finally {
      connection.release();
    }
  };
}
