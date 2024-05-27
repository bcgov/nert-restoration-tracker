import { IDBConnection } from '../database/db';
import { ICreatePlan, IProject } from '../interfaces/project.interface';
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
   * Get a list of plans.
   *
   * @return {*}  {Promise<IProject[]>}
   * @memberof PlanService
   */
  async getPlansList(): Promise<IProject[]> {
    return this.planRepository.getPlansList();
  }

  /**
   * Get a plan by ID.
   *
   * @param {number} id
   * @return {*}  {Promise<IProject>}
   * @memberof PlanService
   */
  async getPlanById(id: number): Promise<IProject> {
    return this.planRepository.getPlanById(id);
  }

  /**
   * Create a plan.
   *
   * @param {ICreatePlan} plan
   * @return {*}  {Promise<{ project_id: number }>}
   * @memberof PlanService
   */
  async createPlan(plan: ICreatePlan): Promise<{ project_id: number }> {
    // insert project
    const projectResponse = await this.projectRepository.insertProject(plan.project);

    // insert contacts
    await Promise.all(
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
