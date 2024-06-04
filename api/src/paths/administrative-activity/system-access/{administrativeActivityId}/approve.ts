import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../../../../constants/administrative-activity';
import { SYSTEM_IDENTITY_SOURCE } from '../../../../constants/database';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { AdministrativeActivityService } from '../../../../services/administrative-activity-service';
import { UserService } from '../../../../services/user-service';
import { coerceUserIdentitySource } from '../../../../utils/keycloak-utils';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/administrative-activity/system-access/{administrativeActivityId}/approve');

export const PUT: Operation = [
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
  approveAccessRequest()
];

PUT.apiDoc = {
  description: 'Update a users system access request and add any specified system roles to the user.',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'administrativeActivityId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['userIdentifier', 'identitySource'],
          properties: {
            userIdentifier: {
              type: 'string',
              description: 'The user identifier for the user.'
            },
            identitySource: {
              type: 'string',
              enum: [
                SYSTEM_IDENTITY_SOURCE.IDIR,
                SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
                SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS
              ]
            },
            roleIds: {
              type: 'array',
              items: {
                type: 'number'
              },
              description:
                'An array of role ids to add, if the access-request was approved. Ignored if the access-request was denied.'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Add system user roles to user OK.'
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

export function approveAccessRequest(): RequestHandler {
  return async (req, res) => {
    const administrativeActivityId = Number(req.params.administrativeActivityId);

    const userGuid = req.body.userGuid;
    const userIdentifier = req.body.userIdentifier;

    // Convert identity sources that have multiple variations (ie: BCEID) into a single value supported by this app
    const identitySource = req.body.identitySource && coerceUserIdentitySource(req.body.identitySource);

    if (!identitySource) {
      throw new HTTP400('Invalid user identity source', [
        `Identity source <${req.body.identitySource}> is not a supported value.`
      ]);
    }

    const roleIds: number[] = req.body.roleIds || [];

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const userService = new UserService(connection);
      const administrativeActivityService = new AdministrativeActivityService(connection);

      // Get the system user (adding or activating them if they already existed).
      const systemUserObject = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);

      // Filter out any system roles that have already been added to the user
      const rolesIdsToAdd = roleIds.filter((roleId) => !systemUserObject.role_ids.includes(roleId));

      if (rolesIdsToAdd?.length) {
        // Add any missing roles (if any)
        await userService.addUserSystemRoles(systemUserObject.id, rolesIdsToAdd);
      }

      // Update the access request record status
      await administrativeActivityService.putAdministrativeActivity(
        administrativeActivityId,
        ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.ACTIONED
      );

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateAccessRequest', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
