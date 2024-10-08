import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ReportService } from '../../../services/reports-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/reports/custom/view');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  viewCustomReportApp()
];

GET.apiDoc = {
  description: 'Get app Custom report data, for view-only purposes.',
  tags: ['report'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'startDate',
      schema: {
        type: 'string'
      },
      required: true
    },
    {
      in: 'query',
      name: 'endDate',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Application Custom report data.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'App Custom report get response array, for view purposes',
              type: 'object',
              required: [
                'id',
                'is_project',
                'name',
                'brief_desc',
                'start_date',
                'end_date',
                'actual_start_date',
                'actual_end_date',
                'state_code',
                'people_involved',
                'is_healing_land',
                'is_healing_people',
                'is_land_initiative',
                'is_cultural_initiative',
                'is_project_part_public_plan',
                'create_date',
                'create_user_name',
                'update_date',
                'update_user_name',
                'objective'
              ],
              properties: {
                id: {
                  description: 'project or plan unique ID.',
                  type: 'number'
                },
                is_project: {
                  description: 'Is a Project or a Plan.',
                  type: 'boolean'
                },
                name: {
                  description: 'Project or Plan name.',
                  type: 'string'
                },
                brief_desc: {
                  description: 'Project or Plan breif description.',
                  type: 'string'
                },
                start_date: {
                  description: 'Project or Plan start date.',
                  type: 'string'
                },
                end_date: {
                  description: 'Project or Plan end date.',
                  type: 'string',
                  nullable: true
                },
                actual_start_date: {
                  description: 'Project actual start date.',
                  type: 'string',
                  nullable: true
                },
                actual_end_date: {
                  description: 'Project actual end date.',
                  type: 'string',
                  nullable: true
                },
                state_code: {
                  description: 'Project or Plan status (state).',
                  type: 'number'
                },
                people_involved: {
                  description: 'Number of people involved (benefited).',
                  type: 'number',
                  nullable: true
                },
                is_healing_land: {
                  description: 'Project or Plan healing the land focus',
                  type: 'boolean'
                },
                is_healing_people: {
                  description: 'Project or Plan healing the people focus',
                  type: 'boolean'
                },
                is_land_initiative: {
                  description: 'Project or Plan land initiative focus',
                  type: 'boolean'
                },
                is_cultural_initiative: {
                  description: 'Project or Plan cultural initiative focus',
                  type: 'boolean'
                },
                is_project_part_public_plan: {
                  description: 'Project is part or not of an existing publi restoration plan.',
                  type: 'boolean',
                  nullable: true
                },
                create_date: {
                  description: 'Project or plan creation time stamp.',
                  type: 'string'
                },
                create_user_name: {
                  description: 'User name that created project or plan.',
                  type: 'string'
                },
                update_date: {
                  description: 'Project or plan update time stamp.',
                  type: 'string',
                  nullable: true
                },
                update_user_name: {
                  description: 'User name that updated project or plan.',
                  type: 'string',
                  nullable: true
                },
                objective: {
                  description: 'Project objectives.',
                  type: 'array',
                  items: {
                    type: 'string',
                    nullable: true
                  }
                },
                contacts: {
                  description: 'Project or Plan contacts list.',
                  type: 'array',
                  items: {
                    type: 'object',
                    nullable: true
                  }
                },
                attachments: {
                  description: 'Project attachments and thumbnail.',
                  type: 'array',
                  items: {
                    type: 'object',
                    nullable: true
                  }
                },
                funding_sources: {
                  description: 'Project funding sources.',
                  type: 'array',
                  items: {
                    type: 'object',
                    nullable: true
                  }
                },
                conservation_areas: {
                  description: 'Project conservation areas.',
                  type: 'array',
                  items: {
                    type: 'object',
                    nullable: true
                  }
                },
                mgmt_region_id: {
                  description: 'Management region object id.',
                  type: 'number',
                  nullable: true
                },
                spatial_type_name: {
                  description: 'Spatial type, Boundary or Mask.',
                  type: 'string',
                  nullable: true
                },
                overlaps_conservation_area: {
                  description: 'Is overlaping conservation areas.',
                  type: 'string',
                  nullable: true
                },
                number_sites: {
                  description: 'Total number of sites.',
                  type: 'number',
                  nullable: true
                },
                size_ha: {
                  description: 'Total area size in hectares of all sites.',
                  type: 'number',
                  nullable: true
                },
                spatial_create_date: {
                  description: 'Spatial object creation time stamp.',
                  type: 'string',
                  nullable: true
                },
                authorizations: {
                  description: 'Project authorizations details.',
                  type: 'array',
                  items: {
                    type: 'object',
                    nullable: true
                  }
                },
                partnerships: {
                  description: 'Project partnerships details.',
                  type: 'array',
                  items: {
                    type: 'object',
                    nullable: true
                  }
                },
                species: {
                  description: 'Project species details.',
                  type: 'array',
                  items: {
                    type: 'object',
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
 * Get Custom report data.
 *
 * @returns {RequestHandler}
 */
export function viewCustomReportApp(): RequestHandler {
  defaultLog.debug({ label: 'viewCustomReportApp' });
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      const reportService = new ReportService(connection);
      const result = await reportService.getCustomReport(req.query.startDate as string, req.query.endDate as string);
      await connection.commit();
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewCustomReportApp', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
