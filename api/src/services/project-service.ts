import { PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/custom-error';
import {
  IPostAuthorization,
  IPostConservationArea,
  IPostContact,
  IPostObjective,
  IPostPartnership,
  PostAuthorizationData,
  PostContactData,
  PostFocusData,
  PostFundingData,
  PostFundingSource,
  PostLocationData,
  PostObjectivesData,
  PostPartnershipsData,
  PostProjectData,
  PostProjectObject,
  PostRestPlanData,
  PostSpeciesData
} from '../models/project-create';
import { ProjectUpdateObject, PutProjectObject } from '../models/project-update';
import {
  GetAuthorizationData,
  GetContactData,
  GetFundingData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetProjectData,
  GetSpeciesData,
  ProjectObject
} from '../models/project-view';
import { AttachmentRepository } from '../repositories/attachment-repository';
import {
  IProjectParticipation,
  ProjectParticipationRepository
} from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { UserObject } from '../repositories/user-repository';
import { getS3SignedURL } from '../utils/file-utils';
import { doAllProjectsHaveAProjectLeadIfUserIsRemoved } from '../utils/user-utils';
import { DBService } from './service';
import { TaxonomyService } from './taxonomy-service';

export class ProjectService extends DBService {
  projectRepository: ProjectRepository;
  projectParticipantRepository: ProjectParticipationRepository;
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.projectRepository = new ProjectRepository(connection);
    this.projectParticipantRepository = new ProjectParticipationRepository(connection);
    this.attachmentRepository = new AttachmentRepository(connection);
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
   * Get the project participant for the given project id and system user.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {(Promise<(IProjectParticipation| UserObject) | null>)}
   * @memberof ProjectParticipationService
   */
  async getProjectParticipant(
    projectId: number,
    systemUserId: number
  ): Promise<(IProjectParticipation | UserObject) | null> {
    return this.projectParticipantRepository.getProjectParticipant(projectId, systemUserId);
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
    const [
      projectData,
      speciesData,
      contactData,
      authorizationData,
      partnershipsData,
      objectivesData,
      fundingData,
      locationData
    ] = await Promise.all([
      this.getProjectData(projectId),
      this.getSpeciesData(projectId),
      this.getContactData(projectId, isPublic),
      this.getAuthorizationData(projectId, isPublic),
      this.getPartnershipsData(projectId),
      this.getObjectivesData(projectId),
      this.getFundingData(projectId, isPublic),
      this.getLocationData(projectId)
    ]);

    return {
      project: projectData,
      species: speciesData,
      contact: contactData,
      authorization: authorizationData,
      partnership: partnershipsData,
      objective: objectivesData,
      funding: fundingData,
      location: locationData
    };
  }

  /**
   * Get a project by its id for editing.
   *
   * @param {number} projectId
   * @return {*}  {Promise<ProjectUpdateObject>}
   * @memberof ProjectService
   */
  async getProjectByIdForEdit(projectId: number): Promise<ProjectUpdateObject> {
    const [
      projectData,
      speciesData,
      contactData,
      partnershipsData,
      objectivesData,
      fundingData,
      locationData,
      authorizationData,
      attachmentData
    ] = await Promise.all([
      this.getProjectData(projectId),
      this.getSpeciesData(projectId),
      this.getContactData(projectId, false),
      this.getPartnershipsData(projectId),
      this.getObjectivesData(projectId),
      this.getFundingData(projectId, false),
      this.getLocationData(projectId),
      this.getAuthorizationData(projectId, false),
      this.attachmentRepository.getProjectAttachmentsByType(projectId, 'thumbnail')
    ]);

    if (attachmentData.length === 0) {
      return {
        project: projectData,
        species: speciesData,
        contact: contactData,
        partnership: partnershipsData,
        objective: objectivesData,
        funding: fundingData,
        location: locationData,
        authorization: authorizationData
      };
    }
    const imageUrl = await getS3SignedURL(attachmentData[0].key);
    const newProjectData = {
      ...projectData,
      image_url: imageUrl,
      image_key: attachmentData[0].key
    };

    return {
      project: newProjectData,
      species: speciesData,
      contact: contactData,
      partnership: partnershipsData,
      objective: objectivesData,
      funding: fundingData,
      location: locationData,
      authorization: authorizationData
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
   * Get authorization data by project id.
   *
   * @param {number} projectId
   * @param {boolean} isPublic
   * @return {*}  {Promise<GetAuthorizationData>}
   * @memberof ProjectService
   */
  async getAuthorizationData(projectId: number, isPublic: boolean): Promise<GetAuthorizationData> {
    if (isPublic) {
      return new GetAuthorizationData();
    }
    return this.projectRepository.getAuthorizationData(projectId);
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
   * Get objectives data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetObjectivesData>}
   * @memberof ProjectService
   */
  async getObjectivesData(projectId: number): Promise<GetObjectivesData> {
    const [objectivesRows] = await Promise.all([this.projectRepository.getObjectivesData(projectId)]);

    return new GetObjectivesData(objectivesRows);
  }

  /**
   * Get funding data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetFundingData>}
   * @memberof ProjectService
   */
  async getFundingData(projectId: number, isPublic: boolean): Promise<GetFundingData> {
    return this.projectRepository.getFundingData(projectId, isPublic);
  }

  /**
   * Get location data by project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<GetLocationData>}
   * @memberof ProjectService
   */
  async getLocationData(projectId: number): Promise<GetLocationData> {
    const [geometryRows, regionRows, conservationAreaRows] = await Promise.all([
      this.projectRepository.getGeometryData(projectId),
      this.projectRepository.getRegionData(projectId),
      this.projectRepository.getConservationAreasData(projectId)
    ]);

    return new GetLocationData(geometryRows, regionRows, conservationAreaRows);
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

    // Handle conservation areas
    promises.push(
      Promise.all(
        postProjectData.location.conservationAreas?.map((conservationArea: IPostConservationArea) =>
          this.insertConservationArea(conservationArea.conservationArea, projectId)
        ) || []
      )
    );

    // Handle new project authorizations
    promises.push(
      Promise.all(
        postProjectData.authorization.authorizations.map((authorization: IPostAuthorization) =>
          this.insertAuthorization(
            authorization.authorization_ref,
            authorization.authorization_type,
            authorization.authorization_desc,
            projectId
          )
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
    const response = await this.projectRepository.updateProjectFocus(focusData, project_id);

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
   * Insert a new project objective.
   *
   * @param {string} objective
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertObjective(objective: string, projectId: number): Promise<number> {
    const response = await this.projectRepository.insertObjective(objective, projectId);

    return response.objective_id;
  }

  /**
   * Insert a new project consevation area.
   *
   * @param {string} conservationArea
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertConservationArea(conservationArea: string, projectId: number): Promise<number> {
    const response = await this.projectRepository.insertConservationArea(conservationArea, projectId);

    return response.conservation_area_id;
  }

  /**
   * Insert a new project authorization.
   *
   * @param {string} authorizationNumber
   * @param {string} authorizationType
   * @param {string} authorizationDesc
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertAuthorization(
    authorizationNumber: string,
    authorizationType: string,
    authorizationDesc: string,
    projectId: number
  ): Promise<number> {
    const response = await this.projectRepository.insertAuthorization(
      authorizationNumber,
      authorizationType,
      authorizationDesc,
      projectId
    );

    return response.permit_id;
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
   * Update a project.
   *
   * @param {number} projectId
   * @param {PutProjectObject} entities
   * @memberof ProjectService
   */
  async updateProject(projectId: number, entities: PutProjectObject) {
    const promises: Promise<any>[] = [];

    if (entities?.project) {
      promises.push(this.updateProjectData(projectId, entities.project));
    }

    if (entities?.focus) {
      promises.push(this.projectRepository.updateProjectFocus(entities.focus, projectId));
    }

    if (entities?.contact) {
      promises.push(this.updateContactData(projectId, entities.contact));
    }

    if (entities?.partnership) {
      promises.push(this.updateProjectPartnershipsData(projectId, entities.partnership));
    }

    if (entities?.objective) {
      promises.push(this.updateProjectObjectivesData(projectId, entities.objective));
    }

    if (entities?.funding) {
      promises.push(this.updateProjectFundingData(projectId, entities.funding));
    }

    if (entities?.authorization) {
      promises.push(this.updateProjectAuthorizationData(projectId, entities.authorization));
    }

    if (entities?.location) {
      promises.push(this.updateProjectSpatialData(projectId, entities.location));
      promises.push(this.updateProjectRegionData(projectId, entities.location));
      promises.push(this.updateProjectConservationAreaData(projectId, entities.location));
    }
    if (entities?.species) {
      promises.push(this.updateProjectSpeciesData(projectId, entities.species));
    }

    await Promise.all(promises);
  }

  /**
   * Update project data.
   *
   * @param {number} projectId
   * @param {PostProjectData} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectData(projectId: number, projectData: PostProjectData): Promise<void> {
    if (!projectData) {
      throw new HTTP400('Failed to parse request body');
    }
    // Update project table
    this.projectRepository.updateProject(projectId, projectData);
  }

  /**
   * Update project contact data.
   *
   * @param {number} projectId
   * @param {PostEditProjectObject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateContactData(projectId: number, putContactData: PostContactData): Promise<void> {
    await this.projectRepository.deleteProjectContact(projectId);

    const insertContactPromises =
      putContactData?.contacts?.map((contact: IPostContact) => {
        return this.insertContact(contact, projectId);
      }) || [];

    await Promise.all([insertContactPromises]);
  }

  /**
   * Update project partnerships data.
   *
   * @param {number} projectId
   * @param {PostPartnershipsData} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectPartnershipsData(projectId: number, partnershipsData: PostPartnershipsData): Promise<void> {
    await this.projectRepository.deleteProjectPartnership(projectId);

    const insertPartnershipsPromises =
      partnershipsData?.partnerships?.map((partnershipData: { partnership: string }) =>
        this.insertPartnership(partnershipData.partnership, projectId)
      ) || [];

    await Promise.all([...insertPartnershipsPromises]);
  }

  /**
   * Update project objectives data.
   *
   * @param {number} projectId
   * @param {PostObjectivesData} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectObjectivesData(projectId: number, objectivesData: PostObjectivesData): Promise<void> {
    await this.projectRepository.deleteProjectObjectives(projectId);

    const insertObjectivesPromises =
      objectivesData?.objectives?.map((objectiveData: { objective: string }) =>
        this.insertObjective(objectiveData.objective, projectId)
      ) || [];

    await Promise.all([...insertObjectivesPromises]);
  }

  /**
   * Update project funding data.
   *
   * @param {number} projectId
   * @param {PostFundingData} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectFundingData(projectId: number, fundingSources: PostFundingData): Promise<void> {
    await this.projectRepository.deleteProjectFundingSource(projectId);

    await Promise.all(
      fundingSources?.funding_sources?.map((item) => {
        return this.insertFundingSource(item, projectId);
      }) || []
    );
  }

  async updateProjectAuthorizationData(projectId: number, authorizationData: PostAuthorizationData): Promise<void> {
    await this.projectRepository.deleteProjectAuthorization(projectId);

    await Promise.all(
      authorizationData?.authorizations.map((authorization) => {
        return this.insertAuthorization(
          authorization.authorization_ref,
          authorization.authorization_type,
          authorization.authorization_desc,
          projectId
        );
      }) || []
    );
  }

  /**
   * Update project spatial data.
   *
   * @param {number} projectId
   * @param {PostLocationData} location
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectSpatialData(projectId: number, location: PostLocationData): Promise<void> {
    await this.projectRepository.deleteProjectLocation(projectId);

    if (!location?.geometry) {
      // No spatial data to insert
      return;
    }

    await this.insertProjectSpatial(location, projectId);
  }

  /**
   * Update project region data.
   *
   * @param {number} projectId
   * @param {PostLocationData} location
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectRegionData(projectId: number, location: PostLocationData): Promise<void> {
    await this.projectRepository.deleteProjectRegion(projectId);

    if (!location?.region) {
      // No spatial data to insert
      return;
    }
    await this.projectRepository.insertProjectRegion(location.region, projectId);
  }

  async updateProjectConservationAreaData(projectId: number, location: PostLocationData): Promise<void> {
    await this.projectRepository.deleteProjectConservationArea(projectId);

    if (!location?.conservationAreas) {
      // No spatial data to insert
      return;
    }

    await Promise.all(
      location?.conservationAreas.map((conservationArea: IPostConservationArea) =>
        this.insertConservationArea(conservationArea.conservationArea, projectId)
      )
    );
  }

  /**
   * Update project species data.
   *
   * @param {number} projectId
   * @param {PostSpeciesData} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectSpeciesData(projectId: number, species: PostSpeciesData): Promise<void> {
    await this.projectRepository.deleteProjectSpecies(projectId);

    if (!species?.focal_species.length) {
      return;
    }

    await Promise.all(
      species?.focal_species.map((speciesId: number) => {
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
   *       contact: GetContactData;
   *       authorization: GetAuthorizationData;
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
      contact: GetContactData;
      authorization: GetAuthorizationData;
      partnership: GetPartnershipsData;
      objective: GetObjectivesData;
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
