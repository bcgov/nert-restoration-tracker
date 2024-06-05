import SQL from 'sql-template-strings';
import { ILocation, IProject } from '../interfaces/project.interface';
import { IPostContact, PostFocusData } from '../models/project-create';
import { GetContactData, GetLocationData, GetProjectData } from '../models/project-view';
import { queries } from '../queries/queries';
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
   * Get Project Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetProjectData>}
   * @memberof ProjectRepository
   */
  async getProjectData(projectId: number): Promise<GetProjectData> {
    defaultLog.debug({ label: 'getProjectData', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
      SELECT
        *
      from
        project
      where
        project.project_id = ${projectId};
    `;

      const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

      const result = (response && response.rows && response.rows[0]) || null;

      return new GetProjectData(result);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Contact Data
   *
   * @param {number} projectId
   * @param {boolean} isPublic
   * @return {*}  {Promise<GetContactData>}
   * @memberof ProjectRepository
   */
  async getContactData(projectId: number, isPublic: boolean): Promise<GetContactData> {
    try {
      const sqlStatementAllColumns = SQL`
      SELECT
        *
      FROM
        project_contact
      WHERE
        project_id = ${projectId}
    `;

      //Will build this sql to select agency ONLY IF the contact is public
      const sqlStatementJustAgencies = SQL``;

      if (isPublic) {
        sqlStatementAllColumns.append(SQL`
        AND is_public = 'Y'
      `);
        sqlStatementJustAgencies.append(SQL`
        SELECT
          agency
        FROM
          project_contact
        WHERE
          project_id = ${projectId}
        AND is_public = 'N'
      `);
      }

      const response = await Promise.all([
        this.connection.query(sqlStatementAllColumns.text, sqlStatementAllColumns.values),
        this.connection.query(sqlStatementJustAgencies.text, sqlStatementJustAgencies.values)
      ]);

      const result = (response[0] && response[1] && [...response[0].rows, ...response[1].rows]) || null;

      return new GetContactData(result);
    } catch (error) {
      defaultLog.debug({ label: 'getContactData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Location Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetLocationData>}
   * @memberof ProjectRepository
   */
  async getLocationData(projectId: number): Promise<GetLocationData> {
    const [geometryRows, regionRows] = await Promise.all([
      this.getGeometryData(projectId),
      this.getRegionData(projectId)
    ]);

    return new GetLocationData(geometryRows, regionRows);
  }

  /**
   * Get Geometry Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<any[]>}
   * @memberof ProjectRepository
   */
  async getGeometryData(projectId: number): Promise<any[]> {
    try {
      const sqlStatement = SQL`
      SELECT
        *
      FROM
        project_spatial_component psc
      LEFT JOIN
        project_spatial_component_type psct
      ON
        psc.project_spatial_component_type_id = psct.project_spatial_component_type_id
      WHERE
        psc.project_id = ${projectId}
      AND
        psct.name = 'Boundary';
    `;

      const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
      return (response && response.rows) || null;
    } catch (error) {
      defaultLog.debug({ label: 'getGeometryData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Region Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<any>}
   * @memberof ProjectRepository
   */
  async getRegionData(projectId: number): Promise<any> {
    try {
      const sqlStatement = SQL`
      SELECT
        *
      FROM
        nrm_region
      WHERE
        project_id = ${projectId};
    `;

      const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

      return (response && response.rows) || null;
    } catch (error) {
      defaultLog.debug({ label: 'getRegionData', message: 'error', error });
      throw error;
    }
  }

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
      const sqlStatement = SQL`
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
    }
  }

  /**
   * Insert a project participant.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {number} projectParticipantRoleId
   * @return {*}
   * @memberof ProjectRepository
   */
  async insertProjectParticipant(projectId: number, systemUserId: number, projectParticipantRole: string) {
    try {
      const sqlStatement = SQL`
      INSERT INTO project_participation (
        project_id,
        system_user_id,
        project_role_id
      )
      (
        SELECT
          ${projectId},
          ${systemUserId},
          project_role_id
        FROM
          project_role
        WHERE
          name = ${projectParticipantRole}
      )
      RETURNING
        *;
    `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectParticipant', message: 'error', error });
      throw error;
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
    }
  }

  /**
   * Insert a project focus.
   *
   * @param {PostFocusData} focusData
   * @param {number} projectId
   * @return {*}  {Promise<{ project_focus_id: number }>}
   * @memberof ProjectRepository
   */
  async insertProjectFocus(focusData: PostFocusData, projectId: number): Promise<{ project_id: number }> {
    defaultLog.debug({ label: 'insertProjectFocus', message: 'params', focusData });

    try {
      let is_healing_land = false;
      let is_healing_people = false;
      let is_land_initiative = false;
      let is_cultural_initiative = false;
      focusData.focuses?.map((focus: number) => {
        switch (focus) {
          case 1:
            is_healing_land = true;
            break;
          case 2:
            is_healing_people = true;
            break;
          case 3:
            is_land_initiative = true;
            break;
          case 4:
            is_cultural_initiative = true;
            break;
        }
      }) || [];

      const sqlStatement = SQL`
        UPDATE project 
        SET is_healing_land = ${is_healing_land},
            is_healing_people = ${is_healing_people},
            is_land_initiative = ${is_land_initiative},
            is_cultural_initiative = ${is_cultural_initiative},
            people_involved = ${focusData.people_involved}
        WHERE project_id = ${projectId}   
        RETURNING
          project_id;
      `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectFocus', message: 'error', error });
      throw error;
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
      const sqlStatement = SQL`
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
  async insertProjectLocation(
    location: ILocation,
    projectId: number
  ): Promise<{ project_spatial_component_id: number }> {
    try {
      defaultLog.debug({
        label: 'insertProjectLocation',
        message: 'params',
        obj: {
          ...location,
          geometry: location?.geometry?.map((item: any) => {
            return { ...item, geometry: 'Too big to print' };
          })
        }
      });
      const componentName = 'Boundary';
      const componentTypeName = 'Boundary';

      const sqlStatement = SQL`
        INSERT INTO project_spatial_component (
          project_id,
          project_spatial_component_type_id,
          name,
          is_within_overlapping,
          number_sites,
          size_ha,
          geojson,
          geography
        ) VALUES (
          ${projectId},
          (SELECT project_spatial_component_type_id from project_spatial_component_type WHERE name = ${componentTypeName}),
          ${componentName},
          ${location.is_within_overlapping === 'false' ? 'N' : location.is_within_overlapping === 'true' ? 'Y' : 'D'},
          ${location.number_sites},
          ${location.size_ha},
          ${JSON.stringify(location.geometry)}
      `;

      const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(location.geometry);

      sqlStatement.append(SQL`
        ,public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
      `);

      sqlStatement.append(geometryCollectionSQL);

      sqlStatement.append(SQL`
        , 4326)))
      `);

      sqlStatement.append(SQL`
        )
        RETURNING
          project_spatial_component_id;
      `);

      console.log('sqlStatement', sqlStatement);
      const response = await this.connection.sql(sqlStatement);
      console.log('response', response);

      const result = (response && response.rows && response.rows[0]) || null;

      return result;
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectLocation', message: 'error', error });
      throw error;
    }
  }

  /**
   * Update a project Contact.
   *
   * @param {IPostContact} contact
   * @param {number} projectId
   * @return {*}  {Promise<{ project_contact_id: number }>}
   * @memberof ProjectRepository
   */
  async updateProjectContact(contact: IPostContact, projectId: number): Promise<{ project_contact_id: number }> {
    defaultLog.debug({ label: 'updateProjectContact', message: 'params', contact });

    try {
      const sqlStatement = SQL`
        UPDATE project_contact
        SET
          first_name = ${contact.first_name},
          last_name = ${contact.last_name},
          agency = ${contact.agency},
          email_address = ${contact.email_address},
          is_public = ${contact.is_public ? 'Y' : 'N'},
          is_primary = ${contact.is_primary ? 'Y' : 'N'}
        WHERE
          project_id = ${projectId}
        AND
          contact_type_id = (SELECT contact_type_id FROM contact_type WHERE name = 'Coordinator')
        RETURNING
          project_contact_id;
      `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'updateProjectContact', message: 'error', error });
      throw error;
    }
  }

  /**
   * Update a project Location.
   *
   * @param {number} projectId
   * @param {ILocation} location
   * @return {*}  {Promise<{ project_spatial_component_id: number }>}
   * @memberof ProjectRepository
   */
  async updateProjectLocation(
    projectId: number,
    location: ILocation
  ): Promise<{ project_spatial_component_id: number }> {
    try {
      const componentName = 'Boundary';
      const componentTypeName = 'Boundary';

      const sqlStatement = SQL`
        UPDATE project_spatial_component
        SET
          name = ${componentName},
          is_within_overlapping = ${
            location.is_within_overlapping === 'false' ? 'N' : location.is_within_overlapping === 'true' ? 'Y' : 'D'
          },
          number_sites = ${location.number_sites},
          size_ha = ${location.size_ha},
          geojson = ${JSON.stringify(location.geometry)}
      `;

      const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(location.geometry);

      sqlStatement.append(SQL`
        ,geography = public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
      `);

      sqlStatement.append(geometryCollectionSQL);

      sqlStatement.append(SQL`
        , 4326)))
        WHERE
          project_id = ${projectId}
        AND
          project_spatial_component_type_id = (SELECT project_spatial_component_type_id from project_spatial_component_type WHERE name = ${componentTypeName})
        RETURNING
          project_spatial_component_id;
      `);

      const response = await this.connection.sql(sqlStatement);

      const result = (response && response.rows && response.rows[0]) || null;

      return result;
    } catch (error) {
      defaultLog.debug({ label: 'updateProjectLocation', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<boolean>}
   * @memberof ProjectRepository
   */
  async deleteProject(projectId: number): Promise<boolean> {
    try {
      const sqlStatement = SQL`call api_delete_project(${projectId})`;

      const response = await this.connection.sql(sqlStatement);

      const result = (response && response.rows && response.rows[0]) || null;

      return result;
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectContact', message: 'error', error });
      throw error;
    }
  }
}
