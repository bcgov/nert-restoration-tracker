import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { ProjectService } from '../../../../services/project-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/participants/self');

export const GET: Operation = [getSelf()];

GET.apiDoc = {
  description: "Get the user's participant record for the given project.",
  tags: ['project', 'participant'],
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
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Project participant roles.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: [
              'project_participation_id',
              'project_id',
              'system_user_id',
              'project_role_ids',
              'project_role_names'
            ],
            properties: {
              project_participation_id: {
                type: 'number'
              },
              project_id: {
                type: 'number'
              },
              system_user_id: {
                type: 'number'
              },
              project_role_ids: {
                type: 'array',
                items: {
                  type: 'number'
                }
              },
              project_role_names: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              project_role_permissions: {
                type: 'array',
                items: {
                  type: 'string'
                },
                nullable: true
              },
              user_identifier: {
                description: 'The unique user identifier',
                type: 'string'
              },
              user_guid: {
                type: 'string',
                description: 'The GUID for the user.',
                nullable: true
              },
              identity_source: {
                description: 'The source of the user identity',
                type: 'string'
              },
              record_end_date: {
                type: 'string',
                description: 'Determines if the user record has expired',
                nullable: true
              },
              role_ids: {
                description: 'list of role ids for the user',
                type: 'array',
                items: {
                  type: 'integer',
                  minimum: 1
                }
              },
              role_names: {
                description: 'list of role names for the user',
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              email: {
                type: 'string',
                nullable: true
              },
              display_name: {
                type: 'string',
                nullable: true
              },
              given_name: {
                type: 'string',
                nullable: true
              },
              family_name: {
                type: 'string',
                nullable: true
              },
              agency: {
                type: 'string',
                nullable: true
              }
            },
            nullable: true
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
      $ref: '#/components/responses/403'
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
 * Get all project participant roles.
 *
 * @returns {RequestHandler}
 */
export function getSelf(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400("Missing required param 'projectId'");
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);

      await connection.open();

      const systemUserId = connection.systemUserId();
      if (!systemUserId) {
        throw new HTTP400("Failed to get the user's system user ID");
      }

      const projectService = new ProjectService(connection);

      const result = await projectService.getProjectParticipant(projectId, systemUserId);

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getAllProjectParticipantsSQL', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
