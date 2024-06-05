import SQL from 'sql-template-strings';
import { PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { HTTP400, HTTP409, HTTP500 } from '../errors/custom-error';
import { models } from '../models/models';
import {
  IPostAuthorization,
  IPostContact,
  IPostIUCN,
  IPostObjective,
  IPostPartnership,
  PostFocusData,
  PostFundingSource,
  PostLocationData,
  PostProjectData,
  PostProjectObject,
  PostRestPlanData
} from '../models/project-create';
import {
  GetContactData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetPermitData,
  GetProjectData,
  GetSpeciesData,
  ProjectObject
} from '../models/project-view';
import { IUpdateProject } from '../paths/project/{projectId}/update';
import { queries } from '../queries/queries';
import { ProjectRepository } from '../repositories/project-repository';
import { DBService } from './service';
import { TaxonomyService } from './taxonomy-service';

export class ProjectService extends DBService {
  projectRepository: ProjectRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.projectRepository = new ProjectRepository(connection);
  }
  /**
   * Gets the project participant, adding them if they do not already exist.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async ensureProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const projectParticipantRecord = await this.getProjectParticipant(systemUserId, projectId);

    if (projectParticipantRecord) {
      // project participant already exists, do nothing
      return;
    }

    // add new models.project.project participant record
    await this.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
  }

  /**
   * Get an existing project participant.
   *
   * @param {number} systemUserId
   * @param {number} projectId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async getProjectParticipant(systemUserId: number, projectId: number): Promise<any> {
    const sqlStatement = queries.projectParticipation.getAllUserProjectsSQL(systemUserId, projectId);

    const response = await this.connection.sql(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to get project team members');
    }

    return response?.rows?.[0] || null;
  }

  /**
   * Get all project participants for a project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<object[]>}
   * @memberof ProjectService
   */
  async getProjectParticipants(projectId: number): Promise<object[]> {
    const sqlStatement = queries.projectParticipation.getAllProjectParticipantsSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project team members');
    }

    return (response && response.rows) || [];
  }

  /**
   * Adds a new models.project.project participant.
   *
   * Note: Will fail if the project participant already exists.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {number} projectParticipantRoleId
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async addProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const sqlStatement = queries.projectParticipation.addProjectRoleByRoleIdSQL(
      projectId,
      systemUserId,
      projectParticipantRoleId
    );

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert project team member');
    }
  }

  /**
   * Get a project by its id.
   *
   * @param {number} projectId
   * @param {boolean} [isPublic=false] Set to `true` if the return value should not include data that is not meant for
   * public consumption.
   * @return {*}  {Promise<ProjectObject>}
   * @memberof ProjectService
   */
  async getProjectById(projectId: number, isPublic = false): Promise<ProjectObject> {
    const [
      projectData,
      speciesData,
      iucnData,
      contactData,
      permitData,
      partnershipsData,
      objectivesData,
      fundingData,
      locationData
    ] = await Promise.all([
      this.getProjectData(projectId),
      this.getSpeciesData(projectId),
      this.getIUCNClassificationData(projectId),
      this.getContactData(projectId, isPublic),
      this.getPermitData(projectId, isPublic),
      this.getPartnershipsData(projectId),
      this.getObjectivesData(projectId),
      this.getFundingData(projectId),
      this.getLocationData(projectId)
    ]);

    return {
      project: projectData,
      species: speciesData,
      iucn: iucnData,
      contact: contactData,
      permit: permitData,
      partnerships: partnershipsData,
      objectives: objectivesData,
      funding: fundingData,
      location: locationData
    };
  }

  async getProjectData(projectId: number): Promise<GetProjectData> {
    const sqlStatement = queries.project.getProjectSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new HTTP400('Failed to get project data');
    }

    return new GetProjectData(result);
  }

  async getSpeciesData(projectId: number): Promise<GetSpeciesData> {
    const sqlStatement = SQL`
      SELECT
        wldtaxonomic_units_id
      FROM
        project_species
      WHERE
        project_id = ${projectId};
      `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get species data');
    }

    const taxonomyService = new TaxonomyService();

    const species = await taxonomyService.getSpeciesFromIds(result);

    return new GetSpeciesData(species);
  }

  async getIUCNClassificationData(projectId: number): Promise<GetIUCNClassificationData> {
    const sqlStatement = SQL`
      SELECT
        ical1c.iucn_conservation_action_level_1_classification_id as classification,
        ical2s.iucn_conservation_action_level_2_subclassification_id as subClassification1,
        ical3s.iucn_conservation_action_level_3_subclassification_id as subClassification2
      FROM
        project_iucn_action_classification as piac
      LEFT OUTER JOIN
        iucn_conservation_action_level_3_subclassification as ical3s
      ON
        piac.iucn_conservation_action_level_3_subclassification_id = ical3s.iucn_conservation_action_level_3_subclassification_id
      LEFT OUTER JOIN
        iucn_conservation_action_level_2_subclassification as ical2s
      ON
        ical3s.iucn_conservation_action_level_2_subclassification_id = ical2s.iucn_conservation_action_level_2_subclassification_id
      LEFT OUTER JOIN
        iucn_conservation_action_level_1_classification as ical1c
      ON
        ical2s.iucn_conservation_action_level_1_classification_id = ical1c.iucn_conservation_action_level_1_classification_id
      WHERE
        piac.project_id = ${projectId}
      GROUP BY
        ical1c.iucn_conservation_action_level_1_classification_id,
        ical2s.iucn_conservation_action_level_2_subclassification_id,
        ical3s.iucn_conservation_action_level_3_subclassification_id;
  `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project IUCN data');
    }

    return new GetIUCNClassificationData(result);
  }

  async getContactData(projectId: number, isPublic: boolean): Promise<GetContactData> {
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

    if (!result) {
      throw new HTTP400('Failed to get project contact data');
    }

    return new GetContactData(result);
  }

  async getPermitData(projectId: number, isPublic: boolean): Promise<GetPermitData> {
    if (isPublic) {
      return new GetPermitData();
    }

    const sqlStatement = SQL`
      SELECT
        *
      FROM
        permit
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project permit data');
    }

    return new GetPermitData(result);
  }

  async getPartnershipsData(projectId: number): Promise<GetPartnershipsData> {
    const [partnershipsRows] = await Promise.all([this.getPartnershipsRows(projectId)]);

    if (!partnershipsRows) {
      throw new HTTP400('Failed to get partnerships data');
    }

    return new GetPartnershipsData(partnershipsRows);
  }

  async getPartnershipsRows(projectId: number): Promise<any[]> {
    const sqlStatement = SQL`
      SELECT
        partnership
      FROM
        partnership
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows) || null;
  }

  async getObjectivesData(projectId: number): Promise<GetObjectivesData> {
    const [objectivesRows] = await Promise.all([this.getObjectivesRows(projectId)]);

    if (!objectivesRows) {
      throw new HTTP400('Failed to get objectives data');
    }

    return new GetObjectivesData(objectivesRows);
  }

  async getObjectivesRows(projectId: number): Promise<any[]> {
    const sqlStatement = SQL`
      SELECT
        objective
      FROM
        objective
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows) || null;
  }

  async getFundingData(projectId: number): Promise<GetFundingData> {
    const sqlStatement = SQL`
      SELECT
        pfs.project_funding_source_id as id,
        fs.funding_source_id as agency_id,
        pfs.funding_amount::numeric::int,
        pfs.funding_start_date as start_date,
        pfs.funding_end_date as end_date,
        iac.investment_action_category_id as investment_action_category,
        iac.name as investment_action_category_name,
        fs.name as agency_name,
        pfs.funding_source_project_id as agency_project_id,
        pfs.revision_count as revision_count
      FROM
        project_funding_source as pfs
      LEFT OUTER JOIN
        investment_action_category as iac
      ON
        pfs.investment_action_category_id = iac.investment_action_category_id
      LEFT OUTER JOIN
        funding_source as fs
      ON
        iac.funding_source_id = fs.funding_source_id
      WHERE
        pfs.project_id = ${projectId}
      GROUP BY
        pfs.project_funding_source_id,
        fs.funding_source_id,
        pfs.funding_source_project_id,
        pfs.funding_amount,
        pfs.funding_start_date,
        pfs.funding_end_date,
        iac.investment_action_category_id,
        iac.name,
        fs.name,
        pfs.revision_count
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project funding data');
    }

    return new GetFundingData(result);
  }

  async getLocationData(projectId: number): Promise<GetLocationData> {
    const [geometryRows, regionRows] = await Promise.all([
      this.getGeometryData(projectId),
      this.getRegionData(projectId)
    ]);

    if (!geometryRows) {
      throw new HTTP400('Failed to get geometry data');
    }

    if (!regionRows) {
      throw new HTTP400('Failed to get region data');
    }

    return new GetLocationData(geometryRows, regionRows);
  }

  async getGeometryData(projectId: number): Promise<any[]> {
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
  }

  async getRegionData(projectId: number): Promise<any> {
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
  }

  async getRangeData(projectId: number): Promise<any> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        project_caribou_population_unit
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows) || null;
  }

  async createProject(postProjectData: PostProjectObject): Promise<number> {
    const projectId = await this.insertProject(postProjectData.project);
    const promises: Promise<any>[] = [];

    // Handle contacts
    promises.push(
      Promise.all(
        postProjectData.contact.contacts.map((contact: IPostContact) => this.insertContact(contact, projectId))
      )
    );

    // Handle geometry
    promises.push(this.insertProjectSpatial(postProjectData.location, projectId));

    // Handle funding sources
    promises.push(
      Promise.all(
        postProjectData.funding.funding_sources.map((fundingSource: PostFundingSource) =>
          this.insertFundingSource(fundingSource, projectId)
        )
      )
    );

    //Handle classifications
    promises.push(
      Promise.all(
        postProjectData.iucn.classificationDetails?.map((iucnClassification: IPostIUCN) => {
          if (
            iucnClassification.classification &&
            iucnClassification.subClassification1 &&
            iucnClassification.subClassification2
          )
            return this.insertClassificationDetail(iucnClassification.subClassification2, projectId);
          else return [];
        }) || []
      )
    );

    // Handle partnerships
    promises.push(
      Promise.all(
        postProjectData.partnership.partnerships?.map((partner: IPostPartnership) =>
          this.insertPartnership(partner.partnership, projectId)
        ) || []
      )
    );

    // Handle objectives
    promises.push(
      Promise.all(
        postProjectData.objective.objectives?.map((objective: IPostObjective) =>
          this.insertObjective(objective.objective, projectId)
        ) || []
      )
    );

    // Handle new project authorizations
    promises.push(
      Promise.all(
        postProjectData.authorization.authorizations.map((authorization: IPostAuthorization) =>
          this.insertPermit(authorization.authorization_ref, authorization.authorization_type, projectId)
        )
      )
    );

    // Handle species associated to this project
    promises.push(
      Promise.all(
        postProjectData.species.focal_species.map((speciesId: number) => {
          this.insertSpecies(speciesId, projectId);
        })
      )
    );

    // Handle region associated to this project
    promises.push(this.projectRepository.insertProjectRegion(postProjectData.location.region, projectId));

    // Handle focus
    promises.push(this.insertFocus(postProjectData.focus, projectId));

    // Handle restorationPlan data
    promises.push(this.insertRestPlan(postProjectData.restoration_plan, projectId));

    await Promise.all(promises);

    // The user that creates a project is automatically assigned a project lead role, for this project
    await this.insertProjectParticipantRole(projectId, PROJECT_ROLE.PROJECT_LEAD);

    return projectId;
  }

  async insertProject(projectdata: PostProjectData): Promise<number> {
    const sqlStatement = queries.project.postProjectSQL(projectdata);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project boundary data');
    }

    return result.id;
  }

  async insertContact(contact: IPostContact, project_id: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_contact (
        project_id, contact_type_id, first_name, last_name, agency, email_address, is_public, is_primary
      ) VALUES (
        ${project_id},
        (SELECT contact_type_id FROM contact_type WHERE name = 'Coordinator'),
        ${contact.first_name},
        ${contact.last_name},
        ${contact.agency},
        ${contact.email_address},
        ${contact.is_public ? 'Y' : 'N'},
        ${contact.is_primary ? 'Y' : 'N'}
      )
      RETURNING
        project_contact_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project contact data');
    }

    return result.id;
  }

  async insertProjectSpatial(locationData: PostLocationData, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectBoundarySQL(locationData, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project boundary data');
    }

    return result.id;
  }

  async insertFocus(focusData: PostFocusData, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectFocusSQL(focusData, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to update project focus data');
    }

    return result.id;
  }

  async insertRestPlan(restPlanData: PostRestPlanData, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectRestPlanSQL(restPlanData, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to update project rest plan data');
    }

    return result.id;
  }

  async insertFundingSource(fundingSource: PostFundingSource, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectFundingSourceSQL(fundingSource, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project funding data');
    }

    return result.id;
  }

  async insertPartnership(partner: string, projectId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO partnership (
        project_id,
        partnership
      ) VALUES (
        ${projectId},
        ${partner}
      )
      RETURNING
        partnership_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project partnership data');
    }

    return result.id;
  }

  async insertObjective(objective: string, projectId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO objective (
        project_id,
        objective
      ) VALUES (
        ${projectId},
        ${objective}
      )
      RETURNING
        objective_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project objective data');
    }

    return result.id;
  }

  async insertPermit(permitNumber: string, permitType: string, projectId: number): Promise<number> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      throw new HTTP400('Failed to identify system user ID');
    }

    const sqlStatement = SQL`
      INSERT INTO permit (
        project_id,
        number,
        type,
        system_user_id
      ) VALUES (
        ${projectId},
        ${permitNumber},
        ${permitType},
        ${systemUserId}
      )
      RETURNING
        permit_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project permit data');
    }

    return result.id;
  }

  async insertClassificationDetail(iucn3_id: number | null, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectIUCNSQL(iucn3_id, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project IUCN data');
    }

    return result.id;
  }

  async insertProjectParticipantRole(projectId: number, projectParticipantRole: string): Promise<void> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      throw new HTTP400('Failed to identify system user ID');
    }

    const sqlStatement = queries.projectParticipation.addProjectRoleByRoleNameSQL(
      projectId,
      systemUserId,
      projectParticipantRole
    );

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert project team member');
    }
  }

  async insertSpecies(species_id: number, projectId: number): Promise<void> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      throw new HTTP400('Failed to identify system user ID');
    }

    const sqlStatement = queries.project.postProjectSpeciesSQL(species_id, projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert project species');
    }
  }

  async insertRange(rangeNumber: number, projectId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_caribou_population_unit (
        project_id,
        caribou_population_unit_id
      ) VALUES (
        ${projectId},
        ${rangeNumber}
      )
      RETURNING
      project_caribou_population_unit_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project range data');
    }

    return result.id;
  }

  async updateProject(projectId: number, entities: IUpdateProject) {
    const promises: Promise<any>[] = [];

    if (entities?.project) {
      promises.push(this.updateProjectData(projectId, entities));
    }

    if (entities?.contact) {
      promises.push(this.updateContactData(projectId, entities));
    }

    if (entities?.partnership) {
      promises.push(this.updateProjectPartnershipsData(projectId, entities));
    }

    if (entities?.objective) {
      promises.push(this.updateProjectObjectivesData(projectId, entities));
    }

    if (entities?.iucn) {
      promises.push(this.updateProjectIUCNData(projectId, entities));
    }

    if (entities?.funding) {
      promises.push(this.updateProjectFundingData(projectId, entities));
    }

    if (entities?.location) {
      promises.push(this.updateProjectSpatialData(projectId, entities));
      promises.push(this.updateProjectRegionData(projectId, entities));
    }
    if (entities?.species) {
      promises.push(this.updateProjectSpeciesData(projectId, entities));
    }

    await Promise.all(promises);
  }

  async updateProjectData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putProjectData = (entities?.project && new models.project.PutProjectData(entities.project)) || null;

    // Update project table
    const revision_count = putProjectData?.revision_count ?? null;

    if (!revision_count && revision_count !== 0) {
      throw new HTTP400('Failed to parse request body');
    }

    const sqlUpdateProject = queries.project.putProjectSQL(projectId, putProjectData, revision_count);

    if (!sqlUpdateProject) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const result = await this.connection.query(sqlUpdateProject.text, sqlUpdateProject.values);

    if (!result || !result.rowCount) {
      // TODO if revision count is bad, it is supposed to raise an exception?
      // It currently does skip the update as expected, but it just returns 0 rows updated, and doesn't result in any errors
      throw new HTTP409('Failed to update stale project data');
    }
  }

  async updateContactData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putContactData = new models.project.PostContactData(entities.contact);

    const sqlDeleteStatement = queries.project.deleteContactSQL(projectId);

    if (!sqlDeleteStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deleteResult = await this.connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);

    if (!deleteResult) {
      throw new HTTP409('Failed to delete project contact data');
    }

    const insertContactPromises =
      putContactData?.contacts?.map((contact: IPostContact) => {
        return this.insertContact(contact, projectId);
      }) || [];

    await Promise.all([insertContactPromises]);
  }

  async updateProjectIUCNData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putIUCNData = (entities?.iucn && new models.project.PutIUCNData(entities.iucn)) || null;

    const sqlDeleteStatement = queries.project.deleteIUCNSQL(projectId);

    if (!sqlDeleteStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deleteResult = await this.connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);

    if (!deleteResult) {
      throw new HTTP409('Failed to delete project IUCN data');
    }

    const insertIUCNPromises =
      putIUCNData?.classificationDetails?.map((iucnClassification: IPostIUCN) =>
        this.insertClassificationDetail(iucnClassification.subClassification2, projectId)
      ) || [];

    await Promise.all(insertIUCNPromises);
  }

  async updateProjectPartnershipsData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putPartnershipsData =
      (entities?.partnership && new models.project.PutPartnershipsData(entities.partnership)) || null;

    const sqlDeletePartnershipsStatement = queries.project.deletePartnershipsSQL(projectId);

    if (!sqlDeletePartnershipsStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deletePartnershipsPromises = this.connection.query(
      sqlDeletePartnershipsStatement.text,
      sqlDeletePartnershipsStatement.values
    );

    const [deletePartnershipsResult] = await Promise.all([deletePartnershipsPromises]);

    if (!deletePartnershipsResult) {
      throw new HTTP409('Failed to delete project partnerships data');
    }

    const insertPartnershipsPromises =
      putPartnershipsData?.partnerships?.map((partnership: string) => this.insertPartnership(partnership, projectId)) ||
      [];

    await Promise.all([...insertPartnershipsPromises]);
  }

  async updateProjectObjectivesData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putObjectivesData = (entities?.objective && new models.project.PutObjectivesData(entities.objective)) || null;

    const sqlDeleteObjectivesStatement = queries.project.deleteObjectivesSQL(projectId);

    if (!sqlDeleteObjectivesStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deleteObjectivesPromises = this.connection.query(
      sqlDeleteObjectivesStatement.text,
      sqlDeleteObjectivesStatement.values
    );

    const [deleteObjectivesResult] = await Promise.all([deleteObjectivesPromises]);

    if (!deleteObjectivesResult) {
      throw new HTTP409('Failed to delete project objectives data');
    }

    const insertObjectivesPromises =
      putObjectivesData?.objectives?.map((objective: string) => this.insertObjective(objective, projectId)) || [];

    await Promise.all([...insertObjectivesPromises]);
  }

  async updateProjectFundingData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putFundingSources = entities?.funding && new models.project.PutFundingData(entities.funding);

    const deleteSQLStatement = SQL`
      DELETE
        from project_funding_source
      WHERE
        project_id = ${projectId};
    `;

    const deleteFundingResult = await this.connection.query(deleteSQLStatement.text, deleteSQLStatement.values);

    if (!deleteFundingResult) {
      throw new HTTP409('Failed to delete project funding data');
    }

    await Promise.all(
      putFundingSources?.fundingSources?.map((item) => {
        return this.insertFundingSource(item, projectId);
      }) || []
    );
  }

  async updateProjectSpatialData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putLocationData = entities?.location && new models.project.PutLocationData(entities.location);

    if (!putLocationData?.geometry) {
      // No spatial data to insert
      return;
    }

    const projectSpatialDeleteStatement = queries.project.deleteProjectSpatialSQL(projectId);

    if (!projectSpatialDeleteStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deleteSpatialResult = await this.connection.query(
      projectSpatialDeleteStatement.text,
      projectSpatialDeleteStatement.values
    );

    if (!deleteSpatialResult) {
      throw new HTTP409('Failed to delete spatial data');
    }

    const sqlInsertStatement = queries.project.postProjectBoundarySQL(putLocationData, projectId);

    if (!sqlInsertStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const result = await this.connection.query(sqlInsertStatement.text, sqlInsertStatement.values);

    if (!result || !result.rowCount) {
      throw new HTTP409('Failed to insert project spatial data');
    }
  }

  async updateProjectRegionData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putRegionData = entities?.location && new models.project.PutLocationData(entities.location);

    const projectRegionDeleteStatement = queries.project.deleteProjectRegionSQL(projectId);

    if (!projectRegionDeleteStatement) {
      throw new HTTP500('Failed to build SQL delete statement');
    }

    await this.connection.query(projectRegionDeleteStatement.text, projectRegionDeleteStatement.values);

    if (!putRegionData?.region) {
      // No spatial data to insert
      return;
    }
    await this.projectRepository.insertProjectRegion(putRegionData.region, projectId);
  }

  async updateProjectSpeciesData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putSpeciesData = entities?.species && new models.project.PutSpeciesData(entities.species);

    const projectSpeciesDeleteStatement = queries.project.deleteProjectSpeciesSQL(projectId);

    if (!projectSpeciesDeleteStatement) {
      throw new HTTP500('Failed to build SQL delete statement');
    }

    await this.connection.query(projectSpeciesDeleteStatement.text, projectSpeciesDeleteStatement.values);

    if (!putSpeciesData?.focal_species.length) {
      return;
    }
    await Promise.all(
      putSpeciesData?.focal_species.map((speciesId: number) => {
        this.insertSpecies(speciesId, projectId);
      })
    );
  }

  /**
   * Get projects by their ids.
   *
   * @param {number[]} projectIds
   * @param {boolean} [isPublic=false] Set to `true` if the return value should not include data that is not meant for
   * public consumption.
   * @return {*}  {Promise<
   *     {
   *       project: GetProjectData;
   *       species: GetSpeciesData;
   *       iucn: GetIUCNClassificationData;
   *       contact: GetContactData;
   *       permit: GetPermitData;
   *       partnerships: GetPartnershipsData;
   *       objectives: GetObjectivesData;
   *       funding: GetFundingData;
   *       location: GetLocationData;
   *     }[]
   *   >}
   * @memberof ProjectService
   */
  async getProjectsByIds(
    projectIds: number[],
    isPublic = false
  ): Promise<
    {
      project: GetProjectData;
      species: GetSpeciesData;
      iucn: GetIUCNClassificationData;
      contact: GetContactData;
      permit: GetPermitData;
      partnerships: GetPartnershipsData;
      objectives: GetObjectivesData;
      funding: GetFundingData;
      location: GetLocationData;
    }[]
  > {
    return Promise.all(projectIds.map(async (projectId) => this.getProjectById(projectId, isPublic)));
  }
}
