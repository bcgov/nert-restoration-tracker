import SQL from 'sql-template-strings';
import { IGetReport } from '../interfaces/reports.interface';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/report-repository');

/**
 * A repository class for accessing reports data.
 *
 * @export
 * @class ReportRepository
 * @extends {BaseRepository}
 */
export class ReportRepository extends BaseRepository {
  /**
   * Get a app stats.
   *
   * @return {*}  {Promise<IProject>}
   * @memberof ReportRepository
   */
  async getAppStatsData(): Promise<IGetReport> {
    defaultLog.debug({ label: 'getAppStatsData' });

    try {
      const sqlStatement = SQL`
        SELECT count(*) FROM project WHERE is_project = TRUE AND state_code <> 8
        UNION ALL 
        SELECT count(*) FROM project WHERE is_project = FALSE AND state_code <> 8
        UNION ALL
        SELECT count(*) FROM project WHERE is_project = TRUE AND state_code = 8
        UNION ALL
        SELECT count(*) FROM project WHERE is_project = FALSE AND state_code = 8
        UNION ALL
        SELECT count(*) FROM webform_draft WHERE is_project = TRUE
        UNION ALL
        SELECT count(*) FROM webform_draft WHERE is_project = FALSE
        UNION ALL
        SELECT count(*) FROM system_user_role WHERE system_role_id = 1
        UNION ALL
        SELECT count(*) FROM system_user_role WHERE system_role_id = 2
        UNION ALL
        SELECT count(*) FROM system_user_role WHERE system_role_id = 3;
        SELECT project_id, name, create_date as last_date FROM project WHERE create_date=(SELECT max(create_date) FROM project WHERE is_project = TRUE AND state_code <> 8)
        UNION ALL
        SELECT project_id, name, create_date FROM project WHERE create_date=(SELECT max(create_date) FROM project WHERE is_project = FALSE AND state_code <> 8);
        SELECT project_id, name, update_date as last_date FROM project WHERE update_date=(SELECT max(update_date) FROM project WHERE is_project = TRUE AND state_code <> 8)
        UNION ALL
        SELECT NULL, NULL, NULL;
        SELECT project_id, name, update_date as last_date FROM project WHERE update_date=(SELECT max(update_date) FROM project WHERE is_project = FALSE AND state_code <> 8)
        UNION ALL
        SELECT NULL, NULL, NULL;
      `;

      const response = await this.connection.sql(sqlStatement);

      return {
        project: {
          published_projects: Number(response[0].rows[0].count),
          draft_projects: Number(response[0].rows[4].count),
          archived_projects: Number(response[0].rows[2].count)
        },
        plan: {
          published_plans: Number(response[0].rows[1].count),
          draft_plans: Number(response[0].rows[5].count),
          archived_plans: Number(response[0].rows[3].count)
        },
        user: {
          admins: Number(response[0].rows[6].count),
          creators: Number(response[0].rows[7].count),
          maintainers: Number(response[0].rows[8].count)
        },
        last_created: {
          project: {
            id: response[1].rows[0].project_id,
            name: response[1].rows[0].name,
            datetime: response[1].rows[0].last_date
          },
          plan: {
            id: response[1].rows[1].project_id,
            name: response[1].rows[1].name,
            datetime: response[1].rows[1].last_date
          }
        },
        last_updated: {
          project: {
            id: response[2].rows[0] ? response[2].rows[0].project_id : null,
            name: response[2].rows[0] ? response[2].rows[0].name : null,
            datetime: response[2].rows[0] ? response[2].rows[0].last_date : null
          },
          plan: {
            id: response[3].rows[0] ? response[3].rows[0].project_id : null,
            name: response[3].rows[0] ? response[3].rows[0].name : null,
            datetime: response[3].rows[0] ? response[3].rows[0].last_date : null
          }
        }
      } as IGetReport;
    } catch (error) {
      defaultLog.debug({ label: 'getAppStatsData', message: 'error', error });
      throw error;
    }
  }
}
