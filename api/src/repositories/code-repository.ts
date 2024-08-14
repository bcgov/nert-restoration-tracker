import SQL from 'sql-template-strings';
import { BaseRepository } from './base-repository';

/**
 * A single code value.
 *
 * @export
 * @interface ICode
 */
export interface ICode {
  id: number;
  name: string;
}

/**
 * A code set (an array of ICode values).
 */
export type CodeSet<T extends ICode = ICode> = T[];

export interface IAllCodeSets {
  first_nations: CodeSet;
  regions: CodeSet;
  system_roles: CodeSet;
  project_roles: CodeSet;
  administrative_activity_status_type: CodeSet;
  branding: {
    id: number;
    name: string;
    value: string;
  }[];
}

export class CodeRepository extends BaseRepository {
  /**
   * Fetch first nation codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getFirstNations() {
    const sqlStatement = SQL`
      SELECT
        first_nations_id as id,
        name
      FROM first_nations
      WHERE record_end_date is null 
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch funding source codes.
   *
   * @memberof CodeRepository
   */
  async getFundingSource() {
    const sqlStatement = SQL`
      SELECT
        funding_source_id as id,
        name
      FROM funding_source
      WHERE record_end_date is null 
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch investment action category codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getInvestmentActionCategory() {
    const sqlStatement = SQL`
      SELECT 
        investment_action_category_id as id, 
        funding_source_id as fs_id, 
        name 
      from 
        investment_action_category 
      ORDER BY name ASC
      ;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch system role codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getSystemRoles() {
    const sqlStatement = SQL`
      SELECT
        system_role_id as id,
        name
      FROM system_role
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch project role codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getProjectRoles() {
    const sqlStatement = SQL`
      SELECT
        project_role_id as id,
        name
      FROM project_role
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch administrative activity status type codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getAdministrativeActivityStatusType() {
    const sqlStatement = SQL`
      SELECT
        administrative_activity_status_type_id as id,
        name
      FROM administrative_activity_status_type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch branding.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getBranding() {
    const sqlStatement = SQL`
      SELECT
        branding_id as id,
        name,
        value
      FROM branding
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }
}
