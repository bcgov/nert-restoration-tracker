import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../constants/administrative-activity';
import { IDBConnection } from '../database/db';
import {
  AdministrativeActivityRepository,
  IAdministrativeActivity,
  ICreateAdministrativeActivity
} from '../repositories/administrative-activity-repository';
import { DBService } from './service';

/**
 * Service for working with administrative activity records.
 *
 * An administrative activity record is essentially a "to-do" item for an administrator.
 *
 * @export
 * @class AdministrativeActivityService
 * @extends {DBService}
 */
export class AdministrativeActivityService extends DBService {
  ADMIN_EMAIL: string;
  APP_HOST: string;
  NODE_ENV: string;

  administrativeActivityRepository: AdministrativeActivityRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.ADMIN_EMAIL = process.env.GCNOTIFY_ADMIN_EMAIL || '';
    this.APP_HOST = process.env.APP_HOST || '';
    this.NODE_ENV = process.env.NODE_ENV || '';

    this.administrativeActivityRepository = new AdministrativeActivityRepository(connection);
  }

  /**
   * Fetches all administrative activity records that match the provided type and status criteria.
   *
   * @param {string[]} [administrativeActivityTypeNames]
   * @param {string[]} [administrativeActivityStatusTypes]
   * @return {*}  {Promise<IAdministrativeActivity[]>}
   * @memberof AdministrativeActivityService
   */
  async getAdministrativeActivities(
    administrativeActivityTypeNames?: string[],
    administrativeActivityStatusTypes?: string[]
  ): Promise<IAdministrativeActivity[]> {
    return this.administrativeActivityRepository.getAdministrativeActivities(
      administrativeActivityTypeNames,
      administrativeActivityStatusTypes
    );
  }

  /**
   * Create a new administrative activity record with type "System Access" and status "Pending".
   *
   * @param {number} systemUserId
   * @param {(string | object)} data
   * @return {*}  {Promise<ICreateAdministrativeActivity>}
   * @memberof AdministrativeActivityService
   */
  async createPendingAccessRequest(
    systemUserId: number,
    data: string | object
  ): Promise<ICreateAdministrativeActivity> {
    return this.administrativeActivityRepository.createPendingAccessRequest(systemUserId, data);
  }

  /**
   * Update the status of an existing administrative activity record.
   *
   * @param {number} administrativeActivityId
   * @param {ADMINISTRATIVE_ACTIVITY_STATUS_TYPE} administrativeActivityStatusTypeName
   * @return {*}  {Promise<void>}
   * @memberof AdministrativeActivityService
   */
  async putAdministrativeActivity(
    administrativeActivityId: number,
    administrativeActivityStatusTypeName: ADMINISTRATIVE_ACTIVITY_STATUS_TYPE
  ): Promise<void> {
    return this.administrativeActivityRepository.putAdministrativeActivity(
      administrativeActivityId,
      administrativeActivityStatusTypeName
    );
  }

  /**
   * Fetch an existing administrative activity record for a user, based on their user GUID.
   *
   * @param {string} userGUID
   * @return {*}  {Promise<number>}
   * @memberof AdministrativeActivityService
   */
  async countPendingAdministrativeActivities(userGUID: string): Promise<number> {
    return this.administrativeActivityRepository.countPendingAdministrativeActivities(userGUID);
  }
}
