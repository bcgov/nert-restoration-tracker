import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { IgcNotifyPostReturn } from '../../interfaces/gcnotify';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { GCNotifyService } from '../../services/gcnotify-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/gcnotify');

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
  sendNotification()
];

POST.apiDoc = {
  description: 'Send notification to defined recipient',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Send notification to given recipient',
    content: {
      'application/json': {
        schema: {
          title: 'User Response Object',
          type: 'object',
          required: ['recipient', 'message'],
          properties: {
            recipient: {
              type: 'object',
              properties: {
                emailAddress: {
                  type: 'string'
                },
                phoneNumber: {
                  type: 'string'
                },
                userId: {
                  type: 'number'
                }
              }
            },
            message: {
              type: 'object',
              required: ['header', 'body1', 'body2', 'footer'],
              properties: {
                header: {
                  type: 'string'
                },
                body1: {
                  type: 'string'
                },
                body2: {
                  type: 'string'
                },
                footer: {
                  type: 'string'
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
      description: 'GC Notify Response',
      content: {
        'application/json': {
          schema: {
            title: 'User Response Object',
            type: 'object',
            properties: {
              content: {
                type: 'object'
              },
              id: {
                type: 'string'
              },
              reference: {
                type: 'string'
              },
              scheduled_for: {
                type: 'string'
              },
              template: {
                type: 'object'
              },
              uri: {
                type: 'string'
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
 * Send Notification to a recipient.
 *
 * @returns {RequestHandler}
 */
export function sendNotification(): RequestHandler {
  return async (req, res) => {
    const recipient = req.body?.recipient || null;
    const message = req.body?.message || null;

    try {
      const gcnotifyService = new GCNotifyService();
      let response = {} as IgcNotifyPostReturn;

      if (recipient.emailAddress) {
        response = await gcnotifyService.sendEmailGCNotification(recipient.emailAddress, message);
      }

      if (recipient.phoneNumber) {
        response = await gcnotifyService.sendPhoneNumberGCNotification(recipient.phoneNumber, message);
      }

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'send gcnotify', message: 'error', error });
      throw error;
    }
  };
}
