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
export type CombinedCode = IBrandingCode | IInvestmentActionCategoryCode | IPartnershipCode | ICode;
export interface IPartnershipCode {
  id: number;
  type_id: number;
  name: string;
}

export interface IInvestmentActionCategoryCode {
  id: number;
  fs_id: number;
  name: string;
}

export interface IBrandingCode {
  id: number;
  name: string;
  value: string;
}
export interface IAllCodeSets {
  branding: CodeSet<IBrandingCode>;
  first_nations: CodeSet;
  regions: CodeSet;
  system_roles: CodeSet;
  project_roles: CodeSet;
  administrative_activity_status_type: CodeSet;
  authorization_type: CodeSet;
  partnership_type: CodeSet;
  partnerships: CodeSet<IPartnershipCode>;
}
export enum CodeType {
  FIRST_NATIONS = 'first_nations',
  SYSTEM_ROLES = 'system_roles',
  PROJECT_ROLES = 'project_roles',
  ADMINISTRATIVE_ACTIVITY_STATUS_TYPE = 'administrative_activity_status_type',
  BRANDING = 'branding',
  AUTHORIZATION_TYPE = 'authorization_type',
  PARTNERSHIP_TYPE = 'partnership_type',
  PARTNERSHIPS = 'partnerships'
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

  /**
   * Fetch authorization type codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getAuthorizationType() {
    const sqlStatement = SQL`
      SELECT
        authorization_type_id as id,
        name
      FROM authorization_type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch partnership type codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getPartnershipType() {
    const sqlStatement = SQL`
      SELECT
        partnership_type_id as id,
        name
      FROM partnership_type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch partnerships.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getPartnerships() {
    const sqlStatement = SQL`
      SELECT
        partnerships_id as id,
        partnership_type_id as type_id,
        name
      FROM partnerships
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Update branding.
   *
   * @param {string} name
   * @param {string} value
   * @param {number} id
   * @return {*}
   * @memberof CodeRepository
   */
  async updateBranding(name: string, value: string, id: number) {
    const sqlStatement = SQL`
    UPDATE branding
    SET name = ${name}, value = ${value}
    WHERE branding_id = ${id}
    RETURNING *;
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows[0];
  }

  // async updateFirstNations(name: string, id: number) {
  //   const sqlStatement = SQL`
  //     UPDATE first_nations
  //     SET name = ${name}
  //     WHERE first_nations_id = ${id};
  //   `;

  //   const response = await this.connection.sql(sqlStatement);

  //   return response.rows;
  // }

  // async updateFundingSource(name: string, id: number) {
  //   const sqlStatement = SQL`
  //     UPDATE funding_source
  //     SET name = ${name}
  //     WHERE funding_source_id = ${id};
  //   `;

  //   const response = await this.connection.sql(sqlStatement);

  //   return response.rows;
  // }

  // async updateInvestmentActionCategory(name: string, fs_id: number, id: number) {
  //   const sqlStatement = SQL`
  //     UPDATE investment_action_category
  //     SET name = ${name}, funding_source_id = ${fs_id}
  //     WHERE investment_action_category_id = ${id};
  //   `;

  //   const response = await this.connection.sql(sqlStatement);

  //   return response.rows;
  // }

  // async updateProjectRole(name: string, id: number) {
  //   const sqlStatement = SQL`
  //     UPDATE project_role
  //     SET name = ${name}
  //     WHERE project_role_id = ${id};
  //   `;

  //   const response = await this.connection.sql(sqlStatement);

  //   return response.rows;
  // }

  // async updateAdministrativeActivityStatusType(name: string, id: number) {
  //   const sqlStatement = SQL`
  //     UPDATE administrative_activity_status_type
  //     SET name = ${name}
  //     WHERE administrative_activity_status_type_id = ${id};
  //   `;

  //   const response = await this.connection.sql(sqlStatement);

  //   return response.rows;
  // }

  // async updateAuthorizationType(name: string, id: number) {
  //   const sqlStatement = SQL`
  //     UPDATE authorization_type
  //     SET name = ${name}
  //     WHERE authorization_type_id = ${id};
  //   `;

  //   const response = await this.connection.sql(sqlStatement);

  //   return response.rows;
  // }

  // async updatePartnershipType(name: string, id: number) {
  //   const sqlStatement = SQL`
  //     UPDATE partnership_type
  //     SET name = ${name}
  //     WHERE partnership_type_id = ${id};
  //   `;

  //   const response = await this.connection.sql(sqlStatement);

  //   return response.rows;
  // }

  // async updatePartnership(name: string, id: number) {
  //   const sqlStatement = SQL`
  //     UPDATE partnerships
  //     SET name = ${name}
  //     WHERE partnerships_id = ${id};
  //   `;

  //   const response = await this.connection.sql(sqlStatement);

  //   return response.rows;
  // }
}
