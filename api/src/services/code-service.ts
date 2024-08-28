import { IDBConnection } from '../database/db';
import { CodeRepository, IAllCodeSets } from '../repositories/code-repository';
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
}
