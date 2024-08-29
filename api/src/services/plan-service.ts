import { PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ICreatePlan, IEditPlan, IGetPlan } from '../interfaces/project.interface';
import { GetContactData, GetLocationData, GetProjectData } from '../models/project-view';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { PlanRepository } from '../repositories/plan-repository';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { getS3SignedURL } from '../utils/file-utils';
import { AttachmentService } from './attachment-service';
import { ProjectService } from './project-service';
import { DBService } from './service';

export class PlanService extends DBService {
  projectRepository: ProjectRepository;
  planRepository: PlanRepository;
  projectParticipationRepository: ProjectParticipationRepository;
  projectService: ProjectService;
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.projectRepository = new ProjectRepository(connection);
    this.planRepository = new PlanRepository(connection);
    this.projectParticipationRepository = new ProjectParticipationRepository(connection);
    this.projectService = new ProjectService(connection);
    this.attachmentRepository = new AttachmentRepository(connection);
  }

  /**
   * Get a list of plans by search criteria.
   *
   * @param {number[]} projectIds
   * @param {boolean} [isPublic=false]
   * @return {*}  {Promise<
   *     {
   *       project: GetProjectData;
   *       contact: GetContactData;
   *       location: GetLocationData;
   *     }[]
   *   >}
   * @memberof PlanService
   */
  async getPlansByIds(
    projectIds: number[],
    isPublic = false
  ): Promise<
    {
      project: GetProjectData;
      contact: GetContactData;
      location: GetLocationData;
    }[]
  > {
    return Promise.all(projectIds.map(async (projectId) => this.getPlanById(projectId, isPublic)));
  }

  /**
   * Get a plan by ID.
   *
   * @param {number} id
   * @return {*}  {Promise<IProject>}
   * @memberof PlanService
   */
  async getPlanById(id: number, isPublic = false): Promise<IGetPlan> {
    const [projectData, contactData, locationData] = await Promise.all([
      this.projectRepository.getProjectData(id),
      this.projectRepository.getContactData(id, isPublic),
      this.projectService.getLocationData(id)
    ]);

    return {
      project: projectData,
      contact: contactData,
      location: locationData
    };
  }

  /**
   * Create a plan.
   *
   * @param {ICreatePlan} plan
   * @return {*}  {Promise<{ project_id: number }>}
   * @memberof PlanService
   */
  async createPlan(plan: ICreatePlan): Promise<{ project_id: number }> {
    const userId = this.connection.systemUserId();

    // insert project
    const planResponse = await this.planRepository.insertPlan(plan.project);

    // insert contacts
    Promise.all(
      plan.contact.contacts.map(async (contact) => {
        await this.projectRepository.insertProjectContact(contact, planResponse.project_id);
      })
    );

    // insert focus
    await this.projectRepository.updateProjectFocus(plan.focus, planResponse.project_id);

    // insert location
    if (plan.location.geometry.length > 0) {
      await this.projectRepository.insertProjectLocation(plan.location, planResponse.project_id);
    }
    // insert region
    if (plan.location.region) {
      await this.projectRepository.insertProjectRegion(plan.location.region, planResponse.project_id);
    }

    await this.projectParticipationRepository.insertProjectParticipantByRoleName(
      planResponse.project_id,
      userId,
      PROJECT_ROLE.PROJECT_LEAD
    );

    return planResponse;
  }

  /**
   * Get a plan by ID for edit.
   *
   * @param {number} id
   * @return {*}  {Promise<IProject>}
   * @memberof PlanService
   */
  async getPlanByIdForEdit(id: number, isPublic = false): Promise<IGetPlan> {
    const [projectData, contactData, locationData, attachmentData] = await Promise.all([
      this.projectRepository.getProjectData(id),
      this.projectRepository.getContactData(id, isPublic),
      this.projectService.getLocationData(id),
      this.attachmentRepository.getProjectAttachmentsByType(id, 'thumbnail')
    ]);

    if (attachmentData.length === 0) {
      const newProjectData = {
        ...projectData,
        image_url: '',
        image_key: ''
      };

      return {
        project: newProjectData,
        contact: contactData,
        location: locationData
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
      contact: contactData,
      location: locationData
    };
  }

  /**
   * Update a plan.
   *
   * @param {number} projectId
   * @param {IEditPlan} plan
   * @return {*}  {Promise<void>}
   * @memberof PlanService
   */
  async updatePlan(projectId: number, plan: IEditPlan): Promise<{ project_id: number }> {
    // update project
    const planResponse = await this.planRepository.updatePlan(plan.project, projectId);

    // update focus
    await this.projectRepository.updateProjectFocus(plan.focus, planResponse.project_id);

    // update contacts
    if (plan.contact.contacts.length > 0) {
      await this.projectRepository.deleteProjectContact(projectId);

      Promise.all(
        plan.contact.contacts.map(async (contact) => {
          await this.projectRepository.insertProjectContact(contact, projectId);
        })
      );
    }

    // update location
    if (plan.location) {
      await this.projectService.updateProjectSpatialData(projectId, plan.location);
    }

    //update region
    if (plan.location.region) {
      await this.projectService.updateProjectRegionData(projectId, plan.location);
    }

    return planResponse;
  }

  /**
   * Delete a plan.
   *
   * @param {number} projectId
   * @return {*}  {Promise<boolean>}
   * @memberof PlanService
   */
  async deletePlan(projectId: number): Promise<boolean> {
    /**
     * PART 1
     * Delete all the plan related and all associated records/resources from S3
     */
    await new AttachmentService(this.connection).deleteAllS3Attachments(projectId);

    /**
     * PART 2
     * Delete the plan and all associated records/resources from our DB
     */
    return this.projectRepository.deleteProject(projectId);
  }
}
