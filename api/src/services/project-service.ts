import { PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/custom-error';
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
import {
  IProjectParticipation,
  ProjectParticipationRepository
} from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { doAllProjectsHaveAProjectLeadIfUserIsRemoved } from '../utils/user-utils';
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
   * Check if a user is the only project lead on any project.
   *
   * @param {number} userId
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async checkIfUserIsOnlyProjectLeadOnAnyProject(userId: number): Promise<void> {
    const allParticipants = await this.projectParticipantRepository.getParticipantsFromAllSystemUsersProjects(userId);

    if (!allParticipants.length) {
      return;
    }

    const onlyProjectLead = doAllProjectsHaveAProjectLeadIfUserIsRemoved(allParticipants, userId);

    if (!onlyProjectLead) {
      throw new HTTP400('Cannot remove user. User is the only Project Lead for one or more projects.');
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

  /**
   * Get all projects by spatial search
   *
   * @param {boolean} isUserAdmin
   * @param {number} [systemUserId]
   * @return {*}
   * @memberof ProjectService
   */
  async getSpatialSearch(
    isUserAdmin: boolean,
    systemUserId?: number
  ): Promise<
    {
      id: number;
      name: string;
      is_project: boolean;
      geometry: any;
    }[]
  > {
    return this.projectRepository.getSpatialSearch(isUserAdmin, systemUserId);
  }

  /**
   * Create a new project.
   *
   * @param {PostProjectObject} postProjectData
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
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

  /**
   * Insert a new project.
   *
   * @param {PostProjectData} projectData
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertProject(projectData: PostProjectData): Promise<number> {
    const response = await this.projectRepository.insertProject(projectData);

    return response.project_id;
  }

  /**
   * Insert a new contact.
   *
   * @param {IPostContact} contact
   * @param {number} project_id
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertContact(contact: IPostContact, project_id: number): Promise<number> {
    const response = await this.projectRepository.insertProjectContact(contact, project_id);

    return response.project_contact_id;
  }

  /**
   * Insert a new project spatial component.
   *
   * @param {PostLocationData} locationData
   * @param {number} project_id
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertProjectSpatial(locationData: PostLocationData, project_id: number): Promise<number> {
    const response = await this.projectRepository.insertProjectLocation(locationData, project_id);

    return response.project_spatial_component_id;
  }

  /**
   * Insert a new project focus.
   *
   * @param {PostFocusData} focusData
   * @param {number} project_id
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertFocus(focusData: PostFocusData, project_id: number): Promise<number> {
    const response = await this.projectRepository.insertProjectFocus(focusData, project_id);

    return response.project_id;
  }

  /**
   * Insert a new project restoration plan.
   *
   * @param {PostRestPlanData} restPlanData
   * @param {number} project_id
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertRestPlan(restPlanData: PostRestPlanData, project_id: number): Promise<number> {
    const response = await this.projectRepository.insertProjectRestPlan(restPlanData, project_id);

    return response.project_id;
  }

  /**
   * Insert a new project funding source.
   *
   * @param {PostFundingSource} fundingSource
   * @param {number} project_id
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertFundingSource(fundingSource: PostFundingSource, project_id: number): Promise<number> {
    const response = await this.projectRepository.insertFundingSource(fundingSource, project_id);

    return response.project_funding_source_id;
  }

  /**
   * Insert a new project partnership.
   *
   * @param {string} partner
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertPartnership(partner: string, projectId: number): Promise<number> {
    const response = await this.projectRepository.insertPartnership(partner, projectId);

    return response.partnership_id;
  }

  /**
   * Insert a new project permit.
   *
   * @param {string} permitNumber
   * @param {string} permitType
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertPermit(permitNumber: string, permitType: string, projectId: number): Promise<number> {
    const response = await this.projectRepository.insertPermit(permitNumber, permitType, projectId);

    return response.permit_id;
  }

  /**
   * Insert a new project classification detail.
   *
   * @param {(number | null)} iucn3_id
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertClassificationDetail(iucn3_id: number | null, projectId: number): Promise<number> {
    const response = await this.projectRepository.insertClassificationDetail(iucn3_id, projectId);

    return response.project_iucn_action_classification_id;
  }

  /**
   * Insert a new project participant role.
   *
   * @param {number} projectId
   * @param {string} projectParticipantRole
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
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

  /**
   * Insert a new species.
   *
   * @param {number} speciesId
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertSpecies(speciesId: number, projectId: number): Promise<number> {
    const response = await this.projectRepository.insertSpecies(speciesId, projectId);

    return response.project_species_id;
  }

  /**
   * Insert a new range.
   *
   * @param {number} rangeNumber
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertRange(rangeNumber: number, projectId: number): Promise<number> {
    const response = await this.projectRepository.insertRange(rangeNumber, projectId);

    return response.project_caribou_population_unit_id;
  }

  /**
   * Update a project.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @memberof ProjectService
   */
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

  /**
   * Update project data.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectData(projectId: number, entities: IUpdateProject): Promise<void> {
    const projectData = entities?.project && new models.project.PutProjectData(entities.project);

    if (!projectData) {
      throw new HTTP400('Failed to parse request body');
    }
    // Update project table
    return this.projectRepository.updateProject(projectId, projectData);
  }

  /**
   * Update project contact data.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateContactData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putContactData = new models.project.PostContactData(entities.contact);

    await this.projectRepository.deleteProjectContact(projectId);

    const insertContactPromises =
      putContactData?.contacts?.map((contact: IPostContact) => {
        return this.insertContact(contact, projectId);
      }) || [];

    await Promise.all([insertContactPromises]);
  }

  /**
   * Update project IUCN data.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectIUCNData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putIUCNData = (entities?.iucn && new models.project.PutIUCNData(entities.iucn)) || null;

    await this.projectRepository.deleteProjectIUCN(projectId);

    const insertIUCNPromises =
      putIUCNData?.classificationDetails?.map((iucnClassification: IPostIUCN) =>
        this.insertClassificationDetail(iucnClassification.subClassification2, projectId)
      ) || [];

    await Promise.all(insertIUCNPromises);
  }

  /**
   * Update project partnerships data.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectPartnershipsData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putPartnershipsData =
      (entities?.partnership && new models.project.PutPartnershipsData(entities.partnership)) || null;

    await this.projectRepository.deleteProjectPartnership(projectId);

    const insertPartnershipsPromises =
      putPartnershipsData?.partnerships?.map((partnership: string) => this.insertPartnership(partnership, projectId)) ||
      [];

    await Promise.all([...insertPartnershipsPromises]);
  }

  /**
   * Update project funding data.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectFundingData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putFundingSources = entities?.funding && new models.project.PutFundingData(entities.funding);

    await this.projectRepository.deleteProjectFundingSource(projectId);

    await Promise.all(
      putFundingSources?.fundingSources?.map((item) => {
        return this.insertFundingSource(item, projectId);
      }) || []
    );
  }

  /**
   * Update project spatial data.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectSpatialData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putLocationData = entities?.location && new models.project.PutLocationData(entities.location);

    await this.projectRepository.deleteProjectLocation(projectId);

    if (!putLocationData?.geometry) {
      // No spatial data to insert
      return;
    }

    await this.insertProjectSpatial(putLocationData, projectId);
  }

  /**
   * Update project region data.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectRegionData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putRegionData = entities?.location && new models.project.PutLocationData(entities.location);

    await this.projectRepository.deleteProjectRegion(projectId);

    if (!putRegionData?.region) {
      // No spatial data to insert
      return;
    }
    await this.projectRepository.insertProjectRegion(putRegionData.region, projectId);
  }

  /**
   * Update project species data.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectSpeciesData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putSpeciesData = entities?.species && new models.project.PutSpeciesData(entities.species);

    await this.projectRepository.deleteProjectSpecies(projectId);

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

  /**
   * Delete Project Participation Record
   *
   * @param {number} projectParticipationId
   * @return {*}
   * @memberof ProjectService
   */
  async deleteProjectParticipationRecord(projectParticipationId: number) {
    return this.projectParticipantRepository.deleteProjectParticipationRecord(projectParticipationId);
  }

  /**
   * Delete Project
   *
   * @param {number} projectId
   * @memberof ProjectService
   */
  async deleteProject(projectId: number) {
    await this.projectRepository.deleteProject(projectId);
  }

  /**
   * Delete Project Funding Source
   *
   * @param {number} projectId
   * @param {number} pfsId
   * @memberof ProjectService
   */
  async deleteFundingSourceById(projectId: number, pfsId: number): Promise<{ project_funding_source_id: number }> {
    return this.projectRepository.deleteFundingSourceById(projectId, pfsId);
  }
}
