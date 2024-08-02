import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import SQL from 'sql-template-strings';
import { getAPIUserDBConnection } from '../../database/db';
import { getLogger } from '../../utils/logger';
import { _extractResults } from '../search';

const defaultLog = getLogger('paths/public/search');

export const GET: Operation = [getSearchResults()];

GET.apiDoc = {
  description: 'Gets a list of published project geometries for public view',
  tags: ['projects'],
  responses: {
    200: {
      description: 'Spatial search response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
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
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get search results for public view (spatially based on boundary).
 *
 * @returns {RequestHandler}
 */
export function getSearchResults(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const sqlStatement = SQL`
        SELECT
          p.project_id as id,
          p.name,
          p.is_project,
          p.state_code,
          psc.number_sites,
          psc.size_ha,
          public.ST_asGeoJSON(psc.geography) as geometry,
          psc.geojson#>>'{}' as geojson
        FROM
          project p
        LEFT JOIN
          project_spatial_component psc
        ON
          p.project_id = psc.project_id
        LEFT join
          project_spatial_component_type psct
        ON
          psc.project_spatial_component_type_id = psct.project_spatial_component_type_id
        WHERE
          psct.name = 'Boundary';
      `;

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      await connection.commit();

      if (!response || !response.rows) {
        return res.status(200).json(null);
      }

      const result: any[] = _extractResults(response.rows);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getSearchResults', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
