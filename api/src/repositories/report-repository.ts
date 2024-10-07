import SQL from 'sql-template-strings';
import { IGetAppUserReport, IGetCustomReport, IGetPIMgmtReport, IGetReport } from '../interfaces/reports.interface';
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
   * @return {*}  {Promise<IGetReport>}
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
        SELECT NULL, NULL, NULL;
        SELECT project_id, name, create_date as last_date FROM project WHERE create_date=(SELECT max(create_date) FROM project WHERE is_project = FALSE AND state_code <> 8)
        UNION ALL
        SELECT NULL, NULL, NULL;
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
            id: response[2].rows[0].project_id,
            name: response[2].rows[0].name,
            datetime: response[2].rows[0].last_date
          }
        },
        last_updated: {
          project: {
            id: response[3].rows[0].project_id,
            name: response[3].rows[0].name,
            datetime: response[3].rows[0].last_date
          },
          plan: {
            id: response[4].rows[0].project_id,
            name: response[4].rows[0].name,
            datetime: response[4].rows[0].last_date
          }
        }
      } as IGetReport;
    } catch (error) {
      defaultLog.debug({ label: 'getAppStatsData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get a app user report.
   *
   * @return {*}  {Promise<IGetAppUserReport>}
   * @memberof ReportRepository
   */
  async getAppUserReportData(): Promise<IGetAppUserReport[]> {
    defaultLog.debug({ label: 'getAppUserReportData' });

    try {
      const sqlStatement = SQL`
        SELECT 
          su.system_user_id AS user_id, 
          su.user_identifier AS user_name, 
          array_remove(array_agg(sr.name), NULL) AS role_names,
          COALESCE(t1.prj_count,0) AS prj_count,
          COALESCE(t2.plan_count,0) AS plan_count,
          COALESCE(t3.arch_prj_count,0) AS arch_prj_count,
          COALESCE(t4.arch_plan_count,0) AS arch_plan_count,
          COALESCE(t5.draft_prj_count,0) AS draft_prj_count,
          COALESCE(t6.draft_plan_count,0) AS draft_plan_count
        FROM system_user su
          LEFT JOIN system_user_role sur ON su.system_user_id = sur.system_user_id
          LEFT JOIN system_role sr ON sur.system_role_id = sr.system_role_id
          LEFT JOIN user_identity_source uis ON su.user_identity_source_id = uis.user_identity_source_id
          LEFT JOIN 
            (SELECT prj.create_user, count(*) AS prj_count
            FROM project prj
            WHERE prj.is_project = TRUE AND prj.state_code <> 8
            GROUP BY
              prj.create_user) t1
            ON t1.create_user = su.system_user_id
          LEFT JOIN
            (SELECT plan.create_user, count(*) AS plan_count 
            FROM project plan
            WHERE plan.is_project = FALSE AND plan.state_code <> 8
            GROUP BY
              plan.create_user) t2
            ON t2.create_user = su.system_user_id
          LEFT JOIN
            (SELECT arch_prj.create_user, count(*) AS arch_prj_count
            FROM project arch_prj
            WHERE arch_prj.is_project = TRUE AND arch_prj.state_code = 8
            GROUP BY
              arch_prj.create_user) t3
            ON t3.create_user = su.system_user_id
          LEFT JOIN
            (SELECT arch_plan.create_user, count(*) AS arch_plan_count
            FROM project arch_plan
            WHERE arch_plan.is_project = FALSE AND arch_plan.state_code = 8
            GROUP BY
              arch_plan.create_user) t4
            ON t4.create_user = su.system_user_id
          LEFT JOIN
            (SELECT draft_prj.create_user, count(*) AS draft_prj_count
            FROM webform_draft draft_prj
            WHERE draft_prj.is_project = TRUE
            GROUP BY
              draft_prj.create_user) t5
            ON t5.create_user = su.system_user_id
          LEFT JOIN
            (SELECT draft_plan.create_user, count(*) AS draft_plan_count
            FROM webform_draft draft_plan
            WHERE draft_plan.is_project = FALSE
            GROUP BY
              draft_plan.create_user) t6
            ON t6.create_user = su.system_user_id
        WHERE
          su.record_end_date IS NULL AND uis.name not IN ('DATABASE', 'SYSTEM')
        GROUP BY
          su.system_user_id,
          su.user_identifier,
          t1.prj_count,
          t2.plan_count,
          t3.arch_prj_count,
          t4.arch_plan_count,
          t5.draft_prj_count,
          t6.draft_plan_count;
      `;

      const response = await this.connection.sql(sqlStatement);
      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getAppUserReportData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get a app PI report.
   *
   * @return {*}  {Promise<IGetPIMgmtReport>}
   * @memberof ReportRepository
   */
  async getPIMgmtReportData(startDate: string, endDate: string): Promise<IGetPIMgmtReport[]> {
    defaultLog.debug({ label: 'getPIMgmtReportData', message: 'params', startDate, endDate });

    try {
      const sqlStatement = SQL`
        SELECT
          su.user_identifier AS user_name,
          al.create_date AS date,
          al.operation,
          al.after_value -> 'project_id' AS project_id,
          al.after_value -> 'is_project' AS is_project,
          prj.name AS project_name,
          al.after_value -> 'file_name' AS file_name,
          al.after_value -> 'file_type' AS file_type
        FROM audit_log al
        LEFT JOIN system_user su ON al.system_user_id = su.system_user_id
        LEFT JOIN project prj ON (al.after_value -> 'project_id')::TEXT::int = prj.project_id
        WHERE
          al.create_date >= DATE(${startDate}) AND 
          al.create_date <= DATE(${endDate}) AND 
          al.operation IN ('INSERT', 'UPDATE') AND
          al.table_name IN ('restoration.project_attachment', 'restoration.project')
        GROUP BY
          prj.name,
          su.user_identifier,
          al.audit_log_id,
          al.create_date,
          al.operation
        ORDER BY al.audit_log_id DESC;
      `;

      const response = await this.connection.sql(sqlStatement);
      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getPIMgmtReportData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get a app Custom report.
   *
   * @return {*}  {Promise<IGetCustomReport>}
   * @memberof ReportRepository
   */
  async getCustomReportData(startDate: string, endDate: string): Promise<IGetCustomReport[]> {
    defaultLog.debug({ label: 'getCustomReportData', message: 'params', startDate, endDate });

    try {
      const sqlStatement = SQL`
        SELECT 
          prj.project_id AS id,
          prj.is_project,
          prj.name,
          prj.brief_desc,
          prj.start_date,
          prj.end_date,
          prj.actual_start_date,
          prj.actual_end_date,
          prj.state_code,
          prj.people_involved,
          prj.is_healing_land,
          prj.is_healing_people,
          prj.is_land_initiative,
          prj.is_cultural_initiative,
          prj.is_project_part_public_plan,
          prj.create_date,
          su.user_identifier AS create_user_name,
          prj.update_date,
          su.user_identifier AS update_user_name,
          array_remove(array_agg(DISTINCT obj.objective), NULL) AS objective,
          COALESCE(jsonb_agg(DISTINCT t1), '[]') AS contacts
        FROM project prj
        LEFT JOIN objective obj ON prj.project_id = obj.project_id
        LEFT JOIN system_user su ON prj.create_user = su.system_user_id
        LEFT JOIN 
          (SELECT pc.project_id, pc.first_name, pc.last_name, pc.organization, pc.email_address, pc.is_primary, pc.is_public, pc.is_first_nation, pc.phone_number
          FROM project_contact pc) t1
          ON prj.project_id = t1.project_id
        WHERE
          prj.create_date >= DATE(${startDate}) AND 
          prj.create_date <= DATE(${endDate})
        GROUP BY
          prj.project_id,
          prj.is_project,
          prj.name,
          prj.brief_desc,
          prj.start_date,
          prj.end_date,
          prj.actual_start_date,
          prj.actual_end_date,
          prj.state_code,
          prj.people_involved,
          prj.is_healing_land,
          prj.is_healing_people,
          prj.is_land_initiative,
          prj.is_cultural_initiative,
          prj.is_project_part_public_plan,
          prj.create_date,
          prj.update_date,
          su.user_identifier
        ORDER BY prj.project_id ASC;
      `;

      const response = await this.connection.sql(sqlStatement);
      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getCustomReportData', message: 'error', error });
      throw error;
    }
  }
}
