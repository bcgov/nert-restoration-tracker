import { IDBConnection } from '../database/db';
import { ICreatePlan, IGetPlan } from '../interfaces/project.interface';
import { GetContactData, GetLocationData, GetProjectData } from '../models/project-view';
import { PlanRepository } from '../repositories/plan-repository';
import { ProjectRepository } from '../repositories/project-repository';
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
    console.log('plan', plan);
    // insert project
    const projectResponse = await this.planRepository.insertPlan(plan.project);
    console.log('projectResponse', projectResponse);

    // insert contacts
    Promise.all(
      plan.contact.contacts.map(async (contact) => {
        await this.projectRepository.insertProjectContact(contact, projectResponse.project_id);
      })
    );

    // insert location
    await this.projectRepository.insertProjectLocation(plan.location, projectResponse.project_id);

    // insert region
    if (plan.location.region) {
      await this.projectRepository.insertProjectRegion(plan.location.region, projectResponse.project_id);
    }

    return projectResponse;
  }
}
