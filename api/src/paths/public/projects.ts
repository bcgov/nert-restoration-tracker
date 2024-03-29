import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../database/db';
import { projectIdResponseObject } from '../../openapi/schemas/project';
import { queries } from '../../queries/queries';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/public/projects');

export const GET: Operation = [getPublicProjectsList()];

GET.apiDoc = {
  description: 'Gets a list of public facing (published) projects.',
  tags: ['public', 'projects'],
  responses: {
    200: {
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              ...(projectIdResponseObject as object)
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
 * Get all public facing (published) projects.
 *
 * @returns {RequestHandler}
 */
export function getPublicProjectsList(): RequestHandler {
  return async (_, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const getProjectListSQLStatement = queries.public.getPublicProjectListSQL();

      await connection.open();

      const response = await connection.query(getProjectListSQLStatement.text, getProjectListSQLStatement.values);

      await connection.commit();

      if (!response.rows) {
        return res.status(200).json(null);
      }

      const project_rows = response.rows;

      const result: any[] = _extractProjects(project_rows);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getProjectList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Extract an array of project data from DB query.
 *
 * @export
 * @param {any[]} rows DB query result rows
 * @return {any[]} An array of project data
 */
export function _extractProjects(rows: any[]): any[] {
  if (!rows || !rows.length) {
    return [];
  }

  const projects: any[] = [];

  rows.forEach((row) => {
    const project: any = {
      id: row.id,
      name: row.name,
      start_date: row.start_date,
      end_date: row.end_date,
      contact_agency_list: row.agency_list,
      permits_list: row.permits_list
    };

    projects.push(project);
  });

  return projects;
}
