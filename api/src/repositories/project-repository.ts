import SQL, { SQLStatement } from 'sql-template-strings';
import { ILocation, IProject } from '../interfaces/project.interface';
import { IPostContact } from '../models/project-create';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/project-repository');

/**
 * A repository class for accessing project data.
 *
 * @export
 * @class ProjectRepository
 * @extends {BaseRepository}
 */
export class ProjectRepository extends BaseRepository {
  /**
   * Insert a project.
   *
   * @param {IProject} project
   * @return {*}  {Promise<{ project_id: number }>}
   * @memberof ProjectRepository
   */
  async insertProject(project: IProject): Promise<{ project_id: number }> {
    defaultLog.debug({ label: 'insertProject', message: 'params', project });

    try {
      const sqlStatement: SQLStatement = SQL`
            INSERT INTO project (
              name,
              brief_desc,
              is_project,
              state_code,
              start_date,
              end_date,
              actual_start_date,
              actual_end_date,
              is_healing_land,
              is_healing_people,
              is_land_initiative,
              is_cultural_initiative,
              people_involved
            ) VALUES (
              ${project.name},
              ${project.brief_desc},
              ${project.is_project},
              ${project.state_code},
              ${project.start_date},
              ${project.end_date},
              ${project.actual_start_date},
              ${project.actual_end_date},
              ${project.is_healing_land},
              ${project.is_healing_people},
              ${project.is_land_initiative},
              ${project.is_cultural_initiative},
              ${project.people_involved}
            )
            RETURNING
              project_id;
          `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertProject', message: 'error', error });
      throw error;
    } finally {
      this.connection.release();
    }
  }

  /**
   * Insert a project contact.
   *
   * @param {number} projectId
   * @param {IPostContact} contact
   * @return {*}  {Promise<{ project_contact_id: number }>}
   * @memberof ProjectRepository
   */
  async insertProjectContact(contact: IPostContact, projectId: number): Promise<{ project_contact_id: number }> {
    defaultLog.debug({ label: 'insertProjectContact', message: 'params', contact });

    try {
      const sqlStatement = SQL`
        INSERT INTO project_contact (
          project_id, contact_type_id, first_name, last_name, agency, email_address, is_public, is_primary
        ) VALUES (
          ${projectId},
          (SELECT contact_type_id FROM contact_type WHERE name = 'Coordinator'),
          ${contact.first_name},
          ${contact.last_name},
          ${contact.agency},
          ${contact.email_address},
          ${contact.is_public ? 'Y' : 'N'},
          ${contact.is_primary ? 'Y' : 'N'}
        )
        RETURNING
          project_contact_id;
      `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectContact', message: 'error', error });
      throw error;
    } finally {
      this.connection.release();
    }
  }

  /**
   * Insert a project region.
   *
   * @param {number} regionNumber
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectRepository
   */
  async insertProjectRegion(regionNumber: number, projectId: number): Promise<{ nrm_region_id: number }> {
    try {
      const sqlStatement: SQLStatement = SQL`
      INSERT INTO nrm_region (
        project_id,
        objectid,
        name
      ) VALUES (
        ${projectId},
        ${regionNumber},
        ${regionNumber}
      )
      RETURNING
        nrm_region_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      const result = (response && response.rows && response.rows[0]) || null;

      return result;
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectContact', message: 'error', error });
      throw error;
    } finally {
      this.connection.release();
    }
  }

  /**
   * Insert a project location.
   *
   * @param {number} projectId
   * @param {ILocation} location
   * @return {*}
   * @memberof ProjectRepository
   */
  async insertProjectLocation(location: ILocation, projectId: number): Promise<{ project_location_id: number }> {
    try {
      const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_location (
        project_id,
        geometry,
        is_within_overlapping,
        region,
        number_sites,
        size_ha
      ) VALUES (
        ${projectId},
        ${location.geometry},
        ${location.is_within_overlapping},
        ${location.region},
        ${location.number_sites},
        ${location.size_ha}
      )
      RETURNING
        project_location_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      const result = (response && response.rows && response.rows[0]) || null;

      return result.id;
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectLocation', message: 'error', error });
      throw error;
    } finally {
      this.connection.release();
    }
  }
}
