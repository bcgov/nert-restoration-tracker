import { IDBConnection } from '../database/db';
import { ApiExecuteSQLError, HTTP400, HTTP500 } from '../errors/custom-error';
import { ProjectParticipantObject, UserObject } from '../models/user';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { UserRepository } from '../repositories/user-repository';
import { doAllProjectsHaveAProjectLead } from '../utils/user-utils';
import { ProjectService } from './project-service';
import { DBService } from './service';

export class UserService extends DBService {
  userRepository: UserRepository;
  projectParticipationRepository: ProjectParticipationRepository;
  projectService: ProjectService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.userRepository = new UserRepository(connection);
    this.projectParticipationRepository = new ProjectParticipationRepository(connection);
    this.projectService = new ProjectService(connection);
  }

  /**
   * Fetch a single system user by their ID.
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<UserObject>)}
   * @memberof UserService
   */
  async getUserById(systemUserId: number): Promise<UserObject> {
    const response = await this.userRepository.getUserById(systemUserId);

    return new UserObject(response);
  }

  /**
   * Get an existing system user by their GUID.
   *
   * @param {string} userGuid The user's GUID
   * @return {*}  {(Promise<UserObject | null>)}
   * @memberof UserService
   */
  async getUserByGuid(userGuid: string): Promise<UserObject | null> {
    const response = await this.userRepository.getUserByGuid(userGuid);

    return new UserObject(response);
  }

  /**
   * Get an existing system user.
   *
   * @param userIdentifier the user's identifier
   * @param identitySource the user's identity source, e.g. `'IDIR'`
   * @return {*}  {(Promise<UserObject | null>)} Promise resolving the UserObject, or `null` if the user wasn't found.
   * @memberof UserService
   */
  async getUserByIdentifier(userIdentifier: string, identitySource: string): Promise<UserObject | null> {
    const response = await this.userRepository.getUserByUserIdentifier(userIdentifier, identitySource);

    return new UserObject(response);
  }

  /**
   * Adds a new system user.
   *
   * Note: Will fail if the system user already exists.
   *
   * @param {string | null} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @return {*}  {Promise<UserObject>}
   * @memberof UserService
   */
  async addSystemUser(userGuid: string | null, userIdentifier: string, identitySource: string): Promise<UserObject> {
    const response = await this.userRepository.addSystemUser(userGuid, userIdentifier, identitySource);

    return new UserObject(response);
  }

  /**
   * Get a list of all system users.
   *
   * @return {*}  {Promise<UserObject[]>}
   * @memberof UserService
   */
  async listSystemUsers(): Promise<UserObject[]> {
    const response = await this.userRepository.getUserList();

    return response.map((row) => new UserObject(row));
  }

  /**
   * Gets a system user, adding them if they do not already exist, or activating them if they had been deactivated (soft
   * deleted).
   *
   * @param {string | null} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @return {*}  {Promise<UserObject>}
   * @memberof UserService
   */
  async ensureSystemUser(userGuid: string | null, userIdentifier: string, identitySource: string): Promise<UserObject> {
    // Check if the user exists in NERT
    let userObject = userGuid
      ? await this.getUserByGuid(userGuid)
      : await this.getUserByIdentifier(userIdentifier, identitySource);

    if (!userObject || !userObject.id) {
      // Id of the current authenticated user
      const systemUserId = this.connection.systemUserId();

      if (!systemUserId) {
        throw new ApiExecuteSQLError('Failed to identify system user ID');
      }

      // Found no existing user, add them
      userObject = await this.addSystemUser(userGuid, userIdentifier, identitySource);
    }

    if (!userObject.record_end_date) {
      // system user is already active
      return userObject;
    }

    // system user is not active, re-activate them
    await this.activateSystemUser(userObject.id);

    // get the newly activated user
    return this.getUserById(userObject.id);
  }

  /**
   * Activates an existing system user that had been deactivated (soft deleted).
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<UserObject>)}
   * @memberof UserService
   */
  async activateSystemUser(systemUserId: number) {
    await this.userRepository.activateSystemUser(systemUserId);
  }

  /**
   * Deactivates an existing system user (soft delete).
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<UserObject>)}
   * @memberof UserService
   */
  async deactivateSystemUser(systemUserId: number) {
    await this.userRepository.deactivateSystemUser(systemUserId);
  }

  /**
   * Delete all system roles for the user.
   *
   * @param {number} systemUserId
   * @memberof UserService
   */
  async deleteUserSystemRoles(systemUserId: number) {
    await this.userRepository.deleteUserSystemRoles(systemUserId);
  }

  /**
   * Delete all project roles for the user.
   *
   * @param {number} systemUserId
   * @memberof UserService
   */
  async deleteAllProjectRoles(systemUserId: number) {
    await this.userRepository.deleteAllProjectRoles(systemUserId);
  }

  /**
   * Adds the specified roleIds to the user.
   *
   * @param {number} systemUserId
   * @param {number[]} roleIds
   * @memberof UserService
   */
  async addUserSystemRoles(systemUserId: number, roleIds: number[]) {
    await this.userRepository.postSystemRoles(systemUserId, roleIds);
  }

  /**
   * Get projects participation data for a user.
   *
   * @param {number} systemUserId user id
   * @param {number} [projectId] optional project id to limit results to a single project
   * @return {*}  {Promise<ProjectParticipantObject[]>}
   * @memberof UserService
   */
  async getUserProjectParticipation(systemUserId: number): Promise<ProjectParticipantObject[]> {
    const response = await this.projectParticipationRepository.getAllUserProjects(systemUserId);

    return response.map((item) => new ProjectParticipantObject(item));
  }

  /**
   * handle delete system user
   *
   * @param {number} systemUserId
   * @memberof UserService
   */
  async handleDeleteSystemUser(systemUserId: number) {
    const usrObject = await this.getUserById(systemUserId);

    if (usrObject.record_end_date) {
      throw new HTTP400('The system user is not active');
    }

    await this.deleteAllProjectRoles(systemUserId);

    await this.deleteUserSystemRoles(systemUserId);

    await this.deactivateSystemUser(systemUserId);
  }

  /**
   * handle delete project participant
   *
   * @param {number} projectParticipationId
   * @param {number} projectId
   * @memberof UserService
   */
  async handleDeleteProjectParticipant(projectParticipationId: number, projectId: number) {
    // Check Lead Editor roles before deleting user
    const projectParticipantsResponse1 = await this.projectService.getProjectParticipants(Number(projectId));
    const projectHasLeadResponse1 = doAllProjectsHaveAProjectLead(projectParticipantsResponse1);

    const result = await this.projectService.deleteProjectParticipationRecord(Number(projectParticipationId));

    if (!result || !result.system_user_id) {
      // The delete result is missing necesary data, fail the request
      throw new HTTP500('Failed to delete project participant');
    }

    // If Lead Editor roles are invalide skip check to prevent removal of only Lead Editor of project
    // (Project is already missing Lead Editor and is in a bad state)
    if (projectHasLeadResponse1) {
      const projectParticipantsResponse2 = await this.projectService.getProjectParticipants(Number(projectId));
      const projectHasLeadResponse2 = doAllProjectsHaveAProjectLead(projectParticipantsResponse2);

      if (!projectHasLeadResponse2) {
        throw new HTTP400('Cannot delete project user. User is the only Lead Editor for the project.');
      }
    }
  }

  /**
   * handle update project participant role
   *
   * @param {number} projectParticipationId
   * @param {number} projectId
   * @param {number} roleId
   * @memberof UserService
   */
  async handleUpdateProjectParticipantRole(projectParticipationId: number, projectId: number, roleId: number) {
    // Check Lead Editor roles before updating user
    const projectParticipantsResponse1 = await this.projectService.getProjectParticipants(projectId);
    const projectHasLeadResponse1 = doAllProjectsHaveAProjectLead(projectParticipantsResponse1);

    // Delete the user's old participation record, returning the old record
    const result = await this.projectService.deleteProjectParticipationRecord(projectParticipationId);

    if (!result || !result.system_user_id) {
      // The delete result is missing necessary data, fail the request
      throw new HTTP500('Failed to update project or plan participant role');
    }

    await this.projectService.addProjectParticipant(projectId, result.system_user_id, roleId);

    // If Lead Editor roles are invalid skip check to prevent removal of only Lead Editor of project
    // (Project is already missing Lead Editor and is in a bad state)
    if (projectHasLeadResponse1) {
      const projectParticipantsResponse2 = await this.projectService.getProjectParticipants(projectId);
      const projectHasLeadResponse2 = doAllProjectsHaveAProjectLead(projectParticipantsResponse2);

      if (!projectHasLeadResponse2) {
        throw new HTTP400('Cannot update project user. User is the only Lead Editor for the project or plan.');
      }
    }
  }
}
