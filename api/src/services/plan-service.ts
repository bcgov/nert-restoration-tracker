import { PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ICreatePlan, IEditPlan, IGetPlan } from '../interfaces/project.interface';
import { GetContactData, GetLocationData, GetProjectData } from '../models/project-view';
import { PlanRepository } from '../repositories/plan-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { AttachmentService } from './attachment-service';
import { DBService } from './service';

export class PlanService extends DBService {
  projectRepository: ProjectRepository;
  planRepository: PlanRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.projectRepository = new ProjectRepository(connection);
    this.planRepository = new PlanRepository(connection);
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
      this.projectRepository.getLocationData(id)
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
    await this.projectRepository.insertProjectFocus(plan.focus, planResponse.project_id);

    // insert location
    await this.projectRepository.insertProjectLocation(plan.location, planResponse.project_id);

    // insert region
    if (plan.location.region) {
      await this.projectRepository.insertProjectRegion(plan.location.region, planResponse.project_id);
    }

    await this.projectRepository.insertProjectParticipant(planResponse.project_id, userId, PROJECT_ROLE.PROJECT_LEAD);

    return planResponse;
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

    // update contacts
    Promise.all(
      plan.contact.contacts.map(async (contact) => {
        await this.projectRepository.insertProjectContact(contact, projectId);
      })
    );

    // update location
    if (plan.location) {
      await this.projectRepository.updateProjectLocation(projectId, plan.location);
    }

    //TODO: FINISH UPDATE FUNCTION
    //update region

    //update focus

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
