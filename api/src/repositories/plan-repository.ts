import SQL from 'sql-template-strings';
import { IProject } from '../interfaces/project.interface';
import { PostPlanData } from '../models/project-create';
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
    }
  }

  /**
   * Insert a plan.
   *
   *
   * @param {PostPlanData} project
   * @return {*}  {Promise<{ project_id: number }>}
   * @memberof PlanRepository
   */
  async insertPlan(plan: PostPlanData): Promise<{ project_id: number }> {
    console.log('plan', plan);
    defaultLog.debug({ label: 'insertPlan', message: 'params', plan });

    try {
      const sqlStatement = SQL`
              INSERT INTO project (
                name,
                brief_desc,
                is_project,
                state_code,
                start_date,
                end_date,
                is_healing_land,
                is_healing_people,
                is_land_initiative,
                is_cultural_initiative
              ) VALUES (
                ${plan.name},
                ${plan.brief_desc},
                ${plan.is_project},
                ${plan.state_code},
                ${plan.start_date},
                ${plan.end_date},
                ${plan.is_healing_land},
                ${plan.is_healing_people},
                ${plan.is_land_initiative},
                ${plan.is_cultural_initiative}
              )
              RETURNING
                project_id;
            `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertPlan', message: 'error', error });
      throw error;
    }
  }

  /**
   * Update a plan.
   *
   * @param {PostPlanData} project
   * @param {number} projectId
   * @return {*}  {Promise<{ project_id: number }>}
   * @memberof PlanRepository
   */
  async updatePlan(project: PostPlanData, projectId: number): Promise<{ project_id: number }> {
    defaultLog.debug({ label: 'updatePlan', message: 'params', project });

    try {
      const sqlStatement = SQL`
        UPDATE project 
        SET 
          name = ${project.name},
          brief_desc = ${project.brief_desc},
          state_code = ${project.state_code},
          start_date = ${project.start_date},
          end_date = ${project.end_date},
          is_healing_land = ${project.is_healing_land},
          is_healing_people = ${project.is_healing_people},
          is_land_initiative = ${project.is_land_initiative},
          is_cultural_initiative = ${project.is_cultural_initiative}
        WHERE project_id = ${projectId}
        RETURNING
          project_id;
      `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'updatePlan', message: 'error', error });
      throw error;
    }
  }
}
