import { IDBConnection } from '../database/db';
import { CodeRepository, CodeType, CombinedCode, IAllCodeSets, IBrandingCode } from '../repositories/code-repository';
import { getNRMRegions } from './../utils/spatial-utils';
import { DBService } from './service';
export class CodeService extends DBService {
  codeRepository: CodeRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.codeRepository = new CodeRepository(connection);
  }
  /**
   * Function that fetches all code sets.
   *
   * @return {*}  {Promise<IAllCodeSets>} an object containing all code sets
   * @memberof CodeService
   */
  async getAllCodeSets(): Promise<IAllCodeSets> {
    const [
      [
        first_nations,
        system_roles,
        project_roles,
        administrative_activity_status_type,
        branding,
        authorization_type,
        partnership_type,
        partnerships
      ],
      regions
    ] = await Promise.all([
      Promise.all([
        this.codeRepository.getFirstNations(),
        this.codeRepository.getSystemRoles(),
        this.codeRepository.getProjectRoles(),
        this.codeRepository.getAdministrativeActivityStatusType(),
        this.codeRepository.getBranding(),
        this.codeRepository.getAuthorizationType(),
        this.codeRepository.getPartnershipType(),
        this.codeRepository.getPartnerships()
      ]),
      getNRMRegions()
    ]);

    return {
      first_nations,
      system_roles,
      project_roles,
      administrative_activity_status_type,
      regions,
      branding,
      authorization_type,
      partnership_type,
      partnerships
    };
  }

  /**
   * Function that updates a code.
   *
   * @param {CodeType} type
   * @param {CombinedCode} data
   * @return {*}  {Promise<any>}
   * @memberof CodeService
   */
  async updateCode(type: CodeType, data: CombinedCode): Promise<any> {
    switch (type) {
      // case CodeType.FIRST_NATIONS:
      //   return this.codeRepository.updateFirstNations(data.name, data.id);
      // case CodeType.PROJECT_ROLES:
      //   return this.codeRepository.updateProjectRole(data.name, data.id);
      // case CodeType.ADMINISTRATIVE_ACTIVITY_STATUS_TYPE:
      //   return this.codeRepository.updateAdministrativeActivityStatusType(data.name, data.id);
      case CodeType.BRANDING:
        return this.codeRepository.updateBranding(data.name, (data as IBrandingCode).value, data.id);
      // case CodeType.AUTHORIZATION_TYPE:
      //   return this.codeRepository.updateAuthorizationType(data.name, data.id);
      // case CodeType.PARTNERSHIP_TYPE:
      //   return this.codeRepository.updatePartnershipType(data.name, data.id);
      // case CodeType.PARTNERSHIPS:
      //   return this.codeRepository.updatePartnership(data.name, data.id);
      default:
        throw new Error(`Invalid code type: ${type}`);
    }
  }
}
