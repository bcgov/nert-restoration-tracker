import SQL, { SQLStatement } from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/custom-error';
import { ILocation, IProject } from '../interfaces/project.interface';
import {
  IPostContact,
  PostFocusData,
  PostFundingSource,
  PostLocationData,
  PostRestPlanData
} from '../models/project-create';
import { PutProjectData } from '../models/project-update';
import {
  GetAuthorizationData,
  GetContactData,
  GetFundingData,
  GetPartnershipsData,
  GetProjectData,
  IGetConservationArea
} from '../models/project-view';
import { getLogger } from '../utils/logger';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
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

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to get project', [
          'ProjectRepository->getProjectData',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return new GetProjectData(response.rows[0]);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Project Species
   *
   * @param {number} projectId
   * @return {*}  {Promise<string[]>}
   * @memberof ProjectRepository
   */
  async getProjectSpecies(projectId: number): Promise<string[]> {
    defaultLog.debug({ label: 'getProjectSpecies', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        SELECT
          itis_tsn
        from
          project_species
        where
          project_id = ${projectId};
      `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getProjectSpecies', message: 'error', error });
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

      //Will build this sql to select organization ONLY IF the contact is public
      const sqlStatementJustAgencies = SQL``;

      if (isPublic) {
        sqlStatementAllColumns.append(SQL`
        AND is_public = 'Y'
      `);
        sqlStatementJustAgencies.append(SQL`
        SELECT
          organization
        FROM
          project_contact
        WHERE
          project_id = ${projectId}
        AND is_public = 'N'
      `);
      }

      const response = await Promise.all([
        this.connection.sql(sqlStatementAllColumns),
        this.connection.sql(sqlStatementJustAgencies)
      ]);

      const result = [
        ...response[0].rows,
        ...response[1].rows.map(() => {
          return {
            organization: 'First Nation'
          };
        })
      ];

      return new GetContactData(result);
    } catch (error) {
      defaultLog.debug({ label: 'getContactData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Permit Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetAuthorizationData>}
   * @memberof ProjectRepository
   */
  async getAuthorizationData(projectId: number): Promise<GetAuthorizationData> {
    try {
      const sqlStatement = SQL`
      SELECT
        *
      FROM
        permit
      WHERE
        project_id = ${projectId};
    `;

      const response = await this.connection.sql(sqlStatement);

      return new GetAuthorizationData(response.rows);
    } catch (error) {
      defaultLog.debug({ label: 'getAuthorizationData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Partnerships Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetPartnershipsData>}
   * @memberof ProjectRepository
   */
  async getPartnershipsData(projectId: number): Promise<GetPartnershipsData> {
    try {
      const sqlStatement = SQL`
      SELECT
        *
      FROM
        partnership
      WHERE
        project_id = ${projectId};
    `;

      const response = await this.connection.sql(sqlStatement);

      return new GetPartnershipsData(response.rows);
    } catch (error) {
      defaultLog.debug({ label: 'getPartnershipsData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Objectives Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<any>}
   * @memberof ProjectRepository
   */
  async getObjectivesData(projectId: number): Promise<any> {
    try {
      const sqlStatement = SQL`
        SELECT
          objective
        FROM
          objective
        WHERE
          project_id = ${projectId};
      `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getObjectivesData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Conservation Areas Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<any>}
   * @memberof ProjectRepository
   */
  async getConservationAreasData(projectId: number): Promise<IGetConservationArea[]> {
    try {
      const sqlStatement = SQL`
        SELECT
        conservation_area
        FROM
        conservation_area
        WHERE
          project_id = ${projectId};
      `;

      const response = await this.connection.sql(sqlStatement);

      const conservationAreas = response.rows.map((row: { conservation_area: string }) => {
        return { conservationArea: row.conservation_area };
      });

      return conservationAreas;
    } catch (error) {
      defaultLog.debug({ label: 'getConservationAreasData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Funding Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetFundingData>}
   * @memberof ProjectRepository
   */
  async getFundingData(projectId: number, isPublic: boolean): Promise<GetFundingData> {
    try {
      const sqlStatement = SQL``;

      if (isPublic) {
        sqlStatement.append(SQL`
          SELECT
            pfs.project_funding_source_id as id,
            pfs.organization_name,
            pfs.funding_amount::numeric::int,
            pfs.funding_start_date as start_date,
            pfs.funding_end_date as end_date,
            pfs.description as description,
            pfs.is_public as is_public,
            pfs.funding_project_id,
            pfs.revision_count as revision_count
          FROM
            project_funding_source as pfs
          WHERE
            pfs.project_id = ${projectId}
          AND
            pfs.is_public = true;
        `);
      } else {
        sqlStatement.append(SQL`
          SELECT
            pfs.project_funding_source_id as id,
            pfs.organization_name,
            pfs.funding_amount::numeric::int,
            pfs.funding_start_date as start_date,
            pfs.funding_end_date as end_date,
            pfs.description,
            pfs.is_public,
            pfs.funding_project_id,
            pfs.revision_count as revision_count
          FROM
            project_funding_source as pfs
          WHERE
            pfs.project_id = ${projectId};
        `);
      }

      const response = await this.connection.sql(sqlStatement);

      const result = (response && response.rows) || null;

      return new GetFundingData(result);
    } catch (error) {
      defaultLog.debug({ label: 'getFundingData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Geometry Data
   * TODO: Interface for this
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

      const response = await this.connection.sql(sqlStatement);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to get Geometry', [
          'ProjectRepository->getGeometryData',
          'rowCount was null or undefined, expected rowCount > 0'
        ]);
      }

      return response && response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getGeometryData', message: 'error', error });
      throw error;
    }
  }

  /**
   * Get Region Data
   * TODO: Interface for this
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

      const response = await this.connection.sql(sqlStatement);

      return (response && response.rows) || null;
    } catch (error) {
      defaultLog.debug({ label: 'getRegionData', message: 'error', error });
      throw error;
    }
  }

  /**
   * get project species.
   *
   * @param {number} speciesId
   * @param {number} projectId
   * @return {*}  {Promise<{ project_species_id: number }>}
   * @memberof ProjectRepository
   */
  async getSpecies(projectId: number): Promise<[{ itis_tsn: number }]> {
    defaultLog.debug({ label: 'getSpecies', message: 'params', projectId });

    const sqlStatement = SQL`
        SELECT 
          itis_tsn
        FROM
          project_species
        WHERE
          project_id = ${projectId};
          `;

    const response = await this.connection.sql(sqlStatement);
    console.log('response', response);

    return response.rows as [{ itis_tsn: number }];
  }

  /**
   * get Location Data for a project if user is admin or system user
   *
   * @param {boolean} isUserAdmin
   * @param {number} [systemUserId]
   * @return {*}
   * @memberof ProjectRepository
   */
  async getSpatialSearch(
    isUserAdmin: boolean,
    systemUserId?: number
  ): Promise<{ id: number; name: string; is_project: boolean; geometry: any }[]> {
    try {
      const sqlStatement = SQL`
        SELECT
          p.project_id as id,
          p.name,
          p.is_project,
          public.ST_asGeoJSON(psc.geography) as geometry
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
          psct.name = 'Boundary'
        `;

      if (!isUserAdmin) {
        sqlStatement.append(SQL` and p.create_user = ${systemUserId};`);
      } else {
        sqlStatement.append(SQL`;`);
      }

      const response = await this.connection.sql(sqlStatement);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to get spatial search results', [
          'ProjectRepository->getSpatialSearch',
          'rowCount was null or undefined, expected rowCount > 0'
        ]);
      }

      return response && response.rows;
    } catch (error) {
      defaultLog.debug({ label: 'getSpatialSearch', message: 'error', error });
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

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project', [
          'ProjectRepository->insertProject',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertProject', message: 'error', error });
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
          project_id, contact_type_id, first_name, last_name, organization, email_address, phone_number, is_public, is_primary, is_first_nation
        ) VALUES (
          ${projectId},
          (SELECT contact_type_id FROM contact_type WHERE name = 'Coordinator'),
          ${contact.first_name},
          ${contact.last_name},
          ${contact.organization},
          ${contact.email_address},
          ${contact.phone_number},
          ${contact.is_public ? 'Y' : 'N'},
          ${contact.is_primary ? 'Y' : 'N'},
          ${contact.is_first_nation}
        )
        RETURNING
          project_contact_id;
      `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project Contact', [
          'ProjectRepository->insertProjectContact',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

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
  async updateProjectFocus(focusData: PostFocusData, projectId: number): Promise<{ project_id: number }> {
    defaultLog.debug({ label: 'updateProjectFocus', message: 'params', focusData });

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

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project focus', [
          'ProjectRepository->updateProjectFocus',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'updateProjectFocus', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project partnership.
   *
   * @param {PostRestPlanData} restPlanData
   * @param {number} projectId
   * @return {*}  {Promise<{ project_id: number }>}
   * @memberof ProjectRepository
   */
  async insertProjectRestPlan(restPlanData: PostRestPlanData, projectId: number): Promise<{ project_id: number }> {
    defaultLog.debug({
      label: 'insertProjectRestPlan',
      message: 'params',
      restPlanData,
      projectId
    });

    try {
      const sqlStatement: SQLStatement = SQL`
      UPDATE project 
      SET is_project_part_public_plan = ${restPlanData.is_project_part_public_plan}
      WHERE project_id = ${projectId}   
      RETURNING
        project_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project rest plan', [
          'ProjectRepository->insertProjectRestPlan',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectRestPlan', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project funding source.
   *
   * @param {PostFundingSource} fundingSource
   * @param {number} projectId
   * @return {*}  {Promise<{ project_funding_source_id: number }>}
   * @memberof ProjectRepository
   */
  async insertFundingSource(
    fundingSource: PostFundingSource,
    projectId: number
  ): Promise<{ project_funding_source_id: number }> {
    defaultLog.debug({ label: 'insertFundingSource', message: 'params', fundingSource });

    try {
      const sqlStatement = SQL`
      INSERT INTO project_funding_source (
        project_id,
        organization_name,
        funding_project_id,
        funding_amount,
        funding_start_date,
        funding_end_date,
        description,
        is_public
      ) VALUES (
        ${projectId},
        ${fundingSource.organization_name},
        ${fundingSource.funding_project_id},
        ${fundingSource.funding_amount},
        ${fundingSource.start_date},
        ${fundingSource.end_date},
        ${fundingSource.description},
        ${fundingSource.is_public}
      )
      RETURNING
        project_funding_source_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project funding source', [
          'ProjectRepository->insertFundingSource',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertFundingSource', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project partnership.
   *
   * @param {number} projectId
   * @param {string} partnership
   * @return {*}  {Promise<{ partnership_id: number }>}
   * @memberof ProjectRepository
   */
  async insertPartnership(partnership: string, projectId: number): Promise<{ partnership_id: number }> {
    defaultLog.debug({ label: 'insertPartnership', message: 'params', partnership });

    try {
      const sqlStatement = SQL`
      INSERT INTO partnership (
        project_id,
        partnership
      ) VALUES (
        ${projectId},
        ${partnership}
      )
      RETURNING
        partnership_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project partnership', [
          'ProjectRepository->insertPartnership',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertPartnership', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project objective.
   *
   * @param {string} objective
   * @param {number} projectId
   * @return {*}  {Promise<{ objective_id: number }>}
   * @memberof ProjectRepository
   */
  async insertObjective(objective: string, projectId: number): Promise<{ objective_id: number }> {
    defaultLog.debug({ label: 'insertObjective', message: 'params', objective });

    try {
      const sqlStatement = SQL`
      INSERT INTO objective (
        project_id,
        objective
      ) VALUES (
        ${projectId},
        ${objective}
      )
      RETURNING
        objective_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project objective', [
          'ProjectRepository->insertObjective',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertObjective', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project conservation area.
   *
   * @param {string} conservationArea
   * @param {number} projectId
   * @return {*}  {Promise<{ conservationArea_id: number }>}
   * @memberof ProjectRepository
   */
  async insertConservationArea(conservationArea: string, projectId: number): Promise<{ conservation_area_id: number }> {
    defaultLog.debug({ label: 'insertConservationArea', message: 'params', conservationArea });

    try {
      const sqlStatement = SQL`
      INSERT INTO conservation_area (
        project_id,
        conservation_area
      ) VALUES (
        ${projectId},
        ${conservationArea}
      )
      RETURNING
      conservation_area_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project conservation area', [
          'ProjectRepository->insertConservationArea',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertConservationArea', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project permit.
   *
   * @param {string} permitNumber
   * @param {string} permitType
   * @param {string} permitDesc
   * @param {number} projectId
   * @return {*}  {Promise<{ permit_id: number }>}
   * @memberof ProjectRepository
   */
  async insertAuthorization(
    permitNumber: string,
    permitType: string,
    permitDesc: string,
    projectId: number
  ): Promise<{ permit_id: number }> {
    defaultLog.debug({
      label: 'insertAuthorization',
      message: 'params',
      permitNumber,
      permitType,
      permitDesc,
      projectId
    });

    try {
      const systemUserId = this.connection.systemUserId();

      const sqlStatement = SQL`
      INSERT INTO permit (
        project_id,
        number,
        type,
        description,
        system_user_id
      ) VALUES (
        ${projectId},
        ${permitNumber},
        ${permitType},
        ${permitDesc},
        ${systemUserId}
      )
      RETURNING
        permit_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert permit ("authorization")', [
          'ProjectRepository->insertAuthorization',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertAuthorization', message: 'error', error });
      throw error;
    }
  }

  /**
   * Insert a project species.
   *
   * @param {number} speciesId
   * @param {number} projectId
   * @return {*}  {Promise<{ project_species_id: number }>}
   * @memberof ProjectRepository
   */
  async insertSpecies(speciesId: number, projectId: number): Promise<{ project_species_id: number }> {
    defaultLog.debug({ label: 'insertSpecies', message: 'params', speciesId, projectId });

    try {
      const sqlStatement = SQL`
      INSERT INTO project_species (
        itis_tsn,
        project_id
      ) VALUES (
        ${speciesId},
        ${projectId}
      )
      RETURNING
        project_species_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert species', [
          'ProjectRepository->insertSpecies',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'insertSpecies', message: 'error', error });
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
    defaultLog.debug({ label: 'insertProjectRegion', message: 'params', regionNumber });

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
      defaultLog.debug({ label: 'insertProjectRegion', message: 'error', error });
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
    location: PostLocationData,
    projectId: number
  ): Promise<{ project_spatial_component_id: number }> {
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

    try {
      const componentName = 'Boundary';
      const componentTypeName = 'Boundary';
      //TODO: This is a bit of a hack, but it works for now.  Need to refactor this to be more dynamic.
      // Should accept as a prop. Also, need to refactor the SQL to be more dynamic.
      // TYPES: Boundary, Overlapping, Other, MASK, etc..

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

      const geometryCollectionSQL = generateGeometryCollectionSQL(location.geometry);

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

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to insert project location', [
          'ProjectRepository->insertProjectLocation',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      const result = (response && response.rows && response.rows[0]) || null;

      return result;
    } catch (error) {
      defaultLog.debug({ label: 'insertProjectLocation', message: 'error', error });
      throw error;
    }
  }

  async updateProject(projectId: number, project: PutProjectData) {
    defaultLog.debug({
      label: 'updateProject',
      message: 'params',
      projectId,
      project
    });

    try {
      const sqlStatement = SQL`
        UPDATE project
        SET
          name = ${project.name},
          brief_desc = ${project.brief_desc},
          is_project = ${project.is_project},
          state_code = ${project.state_code},
          start_date = ${project.start_date},
          end_date = ${project.end_date},
          actual_start_date = ${project.actual_start_date},
          actual_end_date = ${project.actual_end_date},
          people_involved = ${project.people_involved},
          is_project_part_public_plan = ${project.is_project_part_public_plan}
        WHERE
          project_id = ${projectId}
        RETURNING
          project_id;
      `;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to update project', [
          'ProjectRepository->updateProject',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'updateProject', message: 'error', error });
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
    defaultLog.debug({ label: 'updateProjectLocation', message: 'params', location });

    try {
      const componentName = 'Boundary';
      const componentTypeName = 'Boundary';
      //TODO: This is a bit of a hack, but it works for now.  Need to refactor this to be more dynamic.
      // Should accept as a prop. Also, need to refactor the SQL to be more dynamic.
      // TYPES: Boundary, Overlapping, Other, MASK, etc..

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

      const geometryCollectionSQL = generateGeometryCollectionSQL(location.geometry);

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

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to update Location', [
          'ProjectRepository->updateProjectLocation',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      const result = (response && response.rows && response.rows[0]) || null;

      return result;
    } catch (error) {
      defaultLog.debug({ label: 'updateProjectLocation', message: 'error', error });
      throw error;
    }
  }

  /**
   * Update a project Region Details.
   *
   * @param {number} projectId
   * @param {number} regionNumber
   * @return {*}  {Promise<{ nrm_region_id: number }>}
   * @memberof ProjectRepository
   */
  async updateProjectRegion(projectId: number, regionNumber: number): Promise<{ nrm_region_id: number }> {
    defaultLog.debug({ label: 'updateProjectRegion', message: 'params', projectId, regionNumber });

    try {
      const sqlStatement = SQL`
      UPDATE nrm_region
      SET
        objectid = ${regionNumber},
        name = ${regionNumber}
      WHERE
        project_id = ${projectId}
      RETURNING
        nrm_region_id;
    `;

      const response = await this.connection.sql(sqlStatement);

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'updateProjectRegion', message: 'error', error });
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
    defaultLog.debug({ label: 'deleteProject', message: 'params', projectId });

    try {
      const sqlStatement = SQL`call api_delete_project(${projectId})`;

      const response = await this.connection.sql(sqlStatement);

      if (response.rowCount !== 1) {
        throw new ApiExecuteSQLError('Failed to delete Project', [
          'ProjectRepository->deleteProject',
          'rowCount was null or undefined, expected rowCount = 1'
        ]);
      }

      const result = (response && response.rows && response.rows[0]) || null;

      return result;
    } catch (error) {
      defaultLog.debug({ label: 'deleteProject', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project contact.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectContact(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectContact', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from project_contact
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectContact', message: 'error', error });
      throw error;
    }
  }

  async deleteProjectAuthorization(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectAuthorization', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from permit
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectAuthorization', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project partnership.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectPartnership(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectPartnership', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from partnership
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectPartnership', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project objectives.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectObjectives(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectObjectives', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from objective
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectObjectives', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project conservation areas.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectConservationAreas(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectConservationAreas', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from conservation_area
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectConservationAreas', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project funding source.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectFundingSource(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectFundingSource', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from project_funding_source
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectFundingSource', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project funding source.
   *
   * @param {number} projectId
   * @param {number} fundingSourceId
   * @memberof ProjectRepository
   */
  async deleteFundingSourceById(
    projectId: number,
    fundingSourceId: number
  ): Promise<{ project_funding_source_id: number }> {
    defaultLog.debug({ label: 'deleteFundingSource', message: 'params', projectId, fundingSourceId });

    try {
      const sqlStatement = SQL`
        DELETE
          from project_funding_source
        WHERE
          project_id = ${projectId}
        AND
          project_funding_source_id = ${fundingSourceId}
        RETURNING
          project_funding_source_id;
      `;

      const response = await this.connection.sql(sqlStatement);

      if (!response) {
        throw new ApiExecuteSQLError('Failed to delete Funding Source', [
          'ProjectRepository->deleteFundingSource',
          'response was null or undefined'
        ]);
      }

      return response.rows[0];
    } catch (error) {
      defaultLog.debug({ label: 'deleteFundingSource', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project location.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectLocation(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectLocation', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from project_spatial_component
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectLocation', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project region.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectRegion(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectRegion', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from nrm_region
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectRegion', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project species.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectSpecies(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectSpecies', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from project_species
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectSpecies', message: 'error', error });
      throw error;
    }
  }

  /**
   * Delete a project Conservation Area.
   *
   * @param {number} projectId
   * @memberof ProjectRepository
   */
  async deleteProjectConservationArea(projectId: number) {
    defaultLog.debug({ label: 'deleteProjectConservationArea', message: 'params', projectId });

    try {
      const sqlStatement = SQL`
        DELETE
          from conservation_area
        WHERE
          project_id = ${projectId};
      `;

      await this.connection.sql(sqlStatement);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProjectConservationArea', message: 'error', error });
      throw error;
    }
  }
}
