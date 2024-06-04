import { IDBConnection } from '../database/db';
import { ApiExecuteSQLError } from '../errors/custom-error';
import { ProjectParticipantObject, UserObject } from '../models/user';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { UserRepository } from '../repositories/user-repository';
import { DBService } from './service';

export class UserService extends DBService {
  userRepository: UserRepository;
  projectParticipationRepository: ProjectParticipationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.userRepository = new UserRepository(connection);
    this.projectParticipationRepository = new ProjectParticipationRepository(connection);
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
    // Check if the user exists in SIMS
    let userObject = userGuid
      ? await this.getUserByGuid(userGuid)
      : await this.getUserByIdentifier(userIdentifier, identitySource);

    if (!userObject) {
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
}
