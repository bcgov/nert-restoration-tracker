import SQL from 'sql-template-strings';
import { PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { HTTP400, HTTP409, HTTP500 } from '../errors/custom-error';
import { models } from '../models/models';
import {
  IPostAuthorization,
  IPostContact,
  IPostIUCN,
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
  GetPartnershipsData,
  GetPermitData,
  GetProjectData,
  GetSpeciesData,
  ProjectObject
} from '../models/project-view';
import { IUpdateProject } from '../paths/project/{projectId}/update';
import { queries } from '../queries/queries';
import {
  IProjectParticipation,
  ProjectParticipationRepository
} from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { DBService } from './service';
import { TaxonomyService } from './taxonomy-service';

export class ProjectService extends DBService {
  projectRepository: ProjectRepository;
  projectParticipantRepository: ProjectParticipationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.projectRepository = new ProjectRepository(connection);
    this.projectParticipantRepository = new ProjectParticipationRepository(connection);
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
    const projectParticipantRecord = await this.projectParticipantRepository.ensureProjectParticipation(
      projectId,
      systemUserId
    );

    if (projectParticipantRecord) {
      // project participant already exists, do nothing
      return;
    }

    // add new models.project.project participant record
    await this.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
  }

  /**
   * Get all project participants for a project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IProjectParticipation[]>}
   * @memberof ProjectService
   */
  async getProjectParticipants(projectId: number): Promise<IProjectParticipation[]> {
    return this.projectParticipantRepository.getAllProjectParticipants(projectId);
  }

  /**
   * Adds a new models.project.project participant.
   *
   * Note: Will fail if the project participant already exists.
   * TODO: Fix note
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
    this.projectParticipantRepository.insertProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
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
    const [projectData, speciesData, iucnData, contactData, permitData, partnershipsData, fundingData, locationData] =
      await Promise.all([
        this.projectRepository.getProjectData(projectId),
        this.getSpeciesData(projectId),
        this.getIUCNClassificationData(projectId),
        this.getContactData(projectId, isPublic),
        this.getPermitData(projectId, isPublic),
        this.getPartnershipsData(projectId),
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
      funding: fundingData,
      location: locationData
    };
  }

  /**
   * Get project data by its id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetProjectData>}
   * @memberof ProjectService
   */
  async getProjectData(projectId: number): Promise<GetProjectData> {
    return this.projectRepository.getProjectData(projectId);
  }

  /**
   *  Get species data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetSpeciesData>}
   * @memberof ProjectService
   */
  async getSpeciesData(projectId: number): Promise<GetSpeciesData> {
    const response = await this.projectRepository.getProjectSpecies(projectId);

    const taxonomyService = new TaxonomyService();

    const species = await taxonomyService.getSpeciesFromIds(response);

    return new GetSpeciesData(species);
  }

  /**
   * Get IUCN classification data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetIUCNClassificationData>}
   * @memberof ProjectService
   */
  async getIUCNClassificationData(projectId: number): Promise<GetIUCNClassificationData> {
    return this.projectRepository.getIUCNClassificationData(projectId);
  }

  /**
   * Get contact data by project id.
   *
   * @param {number} projectId
   * @param {boolean} isPublic
   * @return {*}  {Promise<GetContactData>}
   * @memberof ProjectService
   */
  async getContactData(projectId: number, isPublic: boolean): Promise<GetContactData> {
    return this.projectRepository.getContactData(projectId, isPublic);
  }

  /**
   * Get permit data by project id.
   *
   * @param {number} projectId
   * @param {boolean} isPublic
   * @return {*}  {Promise<GetPermitData>}
   * @memberof ProjectService
   */
  async getPermitData(projectId: number, isPublic: boolean): Promise<GetPermitData> {
    if (isPublic) {
      return new GetPermitData();
    }
    return this.projectRepository.getPermitData(projectId);
  }

  /**
   * Get partnerships data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetPartnershipsData>}
   * @memberof ProjectService
   */
  async getPartnershipsData(projectId: number): Promise<GetPartnershipsData> {
    return this.projectRepository.getPartnershipsData(projectId);
  }

  /**
   * Get funding data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetFundingData>}
   * @memberof ProjectService
   */
  async getFundingData(projectId: number): Promise<GetFundingData> {
    return this.projectRepository.getFundingData(projectId);
  }

  /**
   * Get location data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetLocationData>}
   * @memberof ProjectService
   */
  async getLocationData(projectId: number): Promise<GetLocationData> {
    const [geometryRows, regionRows] = await Promise.all([
      this.projectRepository.getGeometryData(projectId),
      this.projectRepository.getRegionData(projectId)
    ]);

    return new GetLocationData(geometryRows, regionRows);
  }

  /**
   * Get range data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async getRangeData(projectId: number): Promise<any> {
    return this.projectRepository.getRangeData(projectId);
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

    // Handle partners
    promises.push(
      Promise.all(
        postProjectData.partnership.partnerships?.map((partner: IPostPartnership) =>
          this.insertPartnership(partner.partnership, projectId)
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

    return this.projectParticipantRepository.insertProjectParticipantByRoleName(
      projectId,
      systemUserId,
      projectParticipantRole
    );
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
    const projectData = entities?.project && new models.project.PutProjectData(entities.project);

    if (!projectData) {
      throw new HTTP400('Failed to parse request body');
    }
    // Update project table
    return this.projectRepository.updateProject(projectId, projectData);
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
      funding: GetFundingData;
      location: GetLocationData;
    }[]
  > {
    return Promise.all(projectIds.map(async (projectId) => this.getProjectById(projectId, isPublic)));
  }
}
