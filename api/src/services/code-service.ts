import { coordinator_agency } from '../constants/codes';
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
        funding_source,
        investment_action_category,
        iucn_conservation_action_level_1_classification,
        iucn_conservation_action_level_2_subclassification,
        iucn_conservation_action_level_3_subclassification,
        system_roles,
        project_roles,
        administrative_activity_status_type
      ],
      regions
    ] = await Promise.all([
      Promise.all([
        this.codeRepository.getFirstNations(),
        this.codeRepository.getFundingSource(),
        this.codeRepository.getInvestmentActionCategory(),
        this.codeRepository.getIUCNConservationActionLevel1Classification(),
        this.codeRepository.getIUCNConservationActionLevel2Subclassification(),
        this.codeRepository.getIUCNConservationActionLevel3Subclassification(),
        this.codeRepository.getSystemRoles(),
        this.codeRepository.getProjectRoles(),
        this.codeRepository.getAdministrativeActivityStatusType()
      ]),
      getNRMRegions()
    ]);

    return {
      first_nations,
      funding_source,
      investment_action_category,
      iucn_conservation_action_level_1_classification,
      iucn_conservation_action_level_2_subclassification,
      iucn_conservation_action_level_3_subclassification,
      system_roles,
      project_roles,
      administrative_activity_status_type,
      regions,
      coordinator_agency
    };
  }
}
