import { IProject } from '../interfaces/project.interface';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/plan-repository');

/**
 * A repository class for accessing plan data.
 *
 * @export
 * @class PlanRepository
 * @extends {BaseRepository}
 */
export class PlanRepository extends BaseRepository {
  /**
   * Get a list of plans.
   *
   * @return {*}  {Promise<IProject[]>}
   * @memberof PlanRepository
   */
  async getPlansList(): Promise<IProject[]> {
    defaultLog.debug({ label: 'getPlansList', message: 'params' });

    const connection = await this.connection;

    try {
      const query = 'SELECT * FROM project WHERE is_project = false ORDER BY name ASC;';

      const response = await connection.query(query);

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getPlansList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a plan by ID.
   *
   * @param {number} id
   * @return {*}  {Promise<IProject>}
   * @memberof PlanRepository
   */
  async getPlanById(id: number): Promise<IProject> {
    defaultLog.debug({ label: 'getPlanById', message: 'params', id });

    const connection = await this.connection;

    try {
      const query = 'SELECT * FROM project WHERE project_id = $1 AND is_project = false;';

      const response = await connection.query(query, [id]);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'getPlanById', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  }
}
