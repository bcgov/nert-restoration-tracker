import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-create');

/**
 * Processes all POST /project request data.
 *
 * @export
 * @class PostProjectObject
 */
export class PostProjectObject {
  contact: PostContactData;
  species: PostSpeciesData;
  authorization: PostAuthorizationData;
  project: PostProjectData;
  location: PostLocationData;
  iucn: PostIUCNData;
  funding: PostFundingData;
  partnership: PostPartnershipsData;
  objective: PostObjectivesData;
  focus: PostFocusData;
  restoration_plan: PostRestPlanData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.contact = (obj?.contact && new PostContactData(obj.contact)) || null;
    this.species = (obj?.species && new PostSpeciesData(obj.species)) || null;
    this.authorization = (obj?.authorization && new PostAuthorizationData(obj.authorization)) || null;
    this.project = (obj?.project && new PostProjectData(obj.project)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
    this.funding = (obj?.funding && new PostFundingData(obj.funding)) || null;
    this.iucn = (obj?.iucn && new PostIUCNData(obj.iucn)) || null;
    this.partnership = (obj?.partnership && new PostPartnershipsData(obj.partnership)) || [];
    this.objective = (obj?.objective && new PostObjectivesData(obj.objective)) || [];
    this.focus = (obj?.focus && new PostFocusData(obj.focus)) || [];
    this.restoration_plan = (obj?.restoration_plan && new PostRestPlanData(obj.restoration_plan)) || null;
  }
}

export class PostPlanObject {
  project: PostPlanData;
  focus: PostFocusData;
  contact: PostContactData;
  location: PostLocationData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.project = (obj?.project && new PostPlanData(obj.project)) || null;
    this.focus = (obj?.focus && new PostFocusData(obj.focus)) || [];
    this.contact = (obj?.contact && new PostContactData(obj.contact)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
  }
}

export class PostEditPlanObject {
  project: PostPlanData;
  contact: PostContactData;
  location: PostLocationData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.project = (obj?.project && new PostPlanData(obj.project)) || null;
    this.contact = (obj?.contact && new PostContactData(obj.contact)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
  }
}

export interface IPostContact {
  first_name: string;
  last_name: string;
  email_address: string;
  organization: string;
  phone_number: string;
  is_public: boolean;
  is_primary: boolean;
}

/**
 * Processes POST /project contact data
 *
 * @export
 * @class PostContactData
 */
export class PostContactData {
  contacts: IPostContact[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostContactData', message: 'params', obj });

    this.contacts =
      (obj?.contacts?.length &&
        obj.contacts.map((item: any) => ({
          first_name: item.first_name,
          last_name: item.last_name,
          email_address: item.email_address,
          organization: item.organization,
          phone_number: item.phone_number,
          is_public: JSON.parse(item.is_public),
          is_primary: JSON.parse(item.is_primary)
        }))) ||
      [];
  }
}

export interface IPostAuthorization {
  authorization_ref: string;
  authorization_type: string;
}

/**
 * Processes POST /project Authorization data
 *
 * @export
 * @class PostAuthorizationData
 */
export class PostAuthorizationData {
  authorizations: IPostAuthorization[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostAuthorizationData', message: 'params', obj });

    this.authorizations =
      (obj?.authorizations?.length &&
        obj.authorizations.map((item: any) => {
          return {
            authorization_ref: item.authorization_ref,
            authorization_type: item.authorization_type
          };
        })) ||
      [];
  }
}

export interface IPostPartnership {
  partnership: string;
}

/**
 * Processes POST /project partnerships data
 *
 * @export
 * @class PostPartnershipsData
 */
export class PostPartnershipsData {
  partnerships: IPostPartnership[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPartnershipsData', message: 'params', obj });

    this.partnerships =
      (obj?.partnerships?.length &&
        obj.partnerships.map((item: any) => {
          return {
            partnership: item.partnership
          };
        })) ||
      [];
  }
}

export interface IPostObjective {
  objective: string;
}

/**
 * Processes POST /project objectives data
 *
 * @export
 * @class PostObjectivesData
 */
export class PostObjectivesData {
  objectives: IPostObjective[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostObjectivesData', message: 'params', obj });

    this.objectives =
      (obj?.objectives?.length &&
        obj.objectives.map((item: any) => {
          return {
            objective: item.objective
          };
        })) ||
      [];
  }
}

export interface IPostConservationArea {
  conservationArea: string;
}

/**
 * Processes POST /project conservationAreas data
 *
 * @export
 * @class PostConservationAreasData
 */
export class PostConservationAreasData {
  conservationAreas: IPostConservationArea[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostConservationAreasData', message: 'params', obj });

    this.conservationAreas =
      (obj?.conservationAreas?.length &&
        obj.conservationAreas.map((item: any) => {
          return {
            conservationArea: item.conservationArea
          };
        })) ||
      [];
  }
}

/**
 * Processes POST /project project data.
 *
 * @export
 * @class PostProjectData
 */
export class PostProjectData {
  is_project: boolean;
  name: string;
  state_code: number;
  start_date: string;
  end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  brief_desc: string;
  is_healing_land: boolean;
  is_healing_people: boolean;
  is_land_initiative: boolean;
  is_cultural_initiative: boolean;
  people_involved: number;
  is_project_part_public_plan: boolean;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectData', message: 'params', obj });

    this.is_project = obj?.is_project || null;
    this.name = obj?.project_name || null;
    this.state_code = obj?.state_code || 0;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.actual_start_date = obj?.actual_start_date || null;
    this.actual_end_date = obj?.actual_end_date || null;
    this.brief_desc = obj?.brief_desc || '';
    this.is_healing_land = obj?.is_healing_land || null;
    this.is_healing_people = obj?.is_healing_people || null;
    this.is_land_initiative = obj?.is_land_initiative || null;
    this.is_cultural_initiative = obj?.is_cultural_initiative || null;
    this.people_involved = obj?.people_involved || null;
    this.is_project_part_public_plan = obj?.is_project_part_public_plan || null;
  }
}

/**
 * Processes POST /project project data.
 *
 * @export
 * @class PostPlanData
 */
export class PostPlanData {
  is_project: boolean;
  name: string;
  state_code: number;
  start_date: string;
  end_date: string;
  brief_desc: string;
  is_healing_land: boolean;
  is_healing_people: boolean;
  is_land_initiative: boolean;
  is_cultural_initiative: boolean;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPlanData', message: 'params', obj });

    this.is_project = Boolean(obj?.is_project);
    this.name = obj?.project_name || null;
    this.state_code = obj?.state_code || 0;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.brief_desc = obj?.brief_desc || '';
    this.is_healing_land = Boolean(obj?.is_healing_land);
    this.is_healing_people = Boolean(obj?.is_healing_people);
    this.is_land_initiative = Boolean(obj?.is_land_initiative);
    this.is_cultural_initiative = Boolean(obj?.is_cultural_initiative);
  }
}

/**
 * Processes POST /project species data.
 *
 * @export
 * @class PostSpeciesData
 */
export class PostSpeciesData {
  focal_species: number[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSpeciesData', message: 'params', obj });

    this.focal_species = (obj?.focal_species.length && obj.focal_species) || [];
  }
}

export interface IPostConservationArea {
  conservationArea: string;
}

/**
 * Processes POST /project location data
 *
 * @export
 * @class PostLocationData
 */
export class PostLocationData {
  geometry: Feature[];
  is_within_overlapping: string;
  region: number;
  number_sites: number;
  size_ha: number;
  conservationAreas: IPostConservationArea[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostLocationData', message: 'params', obj });

    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
    this.is_within_overlapping = obj?.is_within_overlapping || 'N';
    this.region = obj?.region || null;
    this.number_sites = obj?.number_sites || null;
    this.size_ha = obj?.size_ha || null;
    this.conservationAreas =
      (obj?.conservationAreas?.length &&
        obj.conservationAreas.map((item: any) => {
          return {
            conservationArea: item.conservationArea
          };
        })) ||
      [];
  }
}

export interface IPostIUCN {
  classification: number | null;
  subClassification1: number | null;
  subClassification2: number | null;
}

/**
 * Processes POST /project IUCN data
 *
 * @export
 * @class PostIUCNData
 */
export class PostIUCNData {
  classificationDetails: IPostIUCN[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostIUCNData', message: 'params', obj });

    this.classificationDetails =
      (obj?.classificationDetails?.length &&
        obj.classificationDetails.map((item: any) => {
          return {
            classification: item.classification,
            subClassification1: item.subClassification1,
            subClassification2: item.subClassification2
          };
        })) ||
      [];
  }
}

/**
 * A single project funding agency.
 *
 * @See PostFundingData
 *
 * @export
 * @class PostFundingSource
 */
export class PostFundingSource {
  agency_id: number;
  investment_action_category: number;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingSource', message: 'params', obj });

    this.agency_id = obj?.agency_id || null;
    this.investment_action_category = obj?.investment_action_category || null;
    this.agency_project_id = obj?.agency_project_id || null;
    this.funding_amount = obj?.funding_amount || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
  }
}

/**
 * Processes POST /project funding data
 *
 * @export
 * @class PostFundingData
 */
export class PostFundingData {
  funding_sources: PostFundingSource[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingData', message: 'params', obj });

    this.funding_sources =
      (obj?.fundingSources?.length && obj.fundingSources.map((item: any) => new PostFundingSource(item))) || [];
  }
}

/**
 * Processes POST /project focus data
 *
 * @export
 * @class PostFocusData
 */
export class PostFocusData {
  focuses: number[];
  people_involved: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFocusData', message: 'params', obj });

    this.focuses = (obj?.focuses.length && obj.focuses) || [];
    this.people_involved = obj?.people_involved || null;
  }
}

/**
 * Processes POST /project restoration_plan data
 *
 * @export
 * @class PostRestPlanData
 */
export class PostRestPlanData {
  is_project_part_public_plan: boolean;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostRestPlanData', message: 'params', obj });

    this.is_project_part_public_plan = obj?.is_project_part_public_plan || null;
  }
}
