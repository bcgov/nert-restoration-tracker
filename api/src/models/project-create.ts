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
  partnerships: PostPartnershipsData;
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
    this.partnerships = (obj?.partnerships && new PostPartnershipsData(obj.partnerships)) || [];
    this.focus = (obj?.focus && new PostFocusData(obj.focus)) || [];
    this.restoration_plan = (obj?.restoration_plan && new PostRestPlanData(obj.restoration_plan)) || null;
  }
}

export class PostPlanObject {
  contact: PostContactData;
  project: PostProjectData;
  location: PostLocationData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.contact = (obj?.contact && new PostContactData(obj.contact)) || null;
    this.project = (obj?.project && new PostProjectData(obj.project)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
  }
}

export interface IPostContact {
  first_name: string;
  last_name: string;
  email_address: string;
  agency: string;
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
          agency: item.agency,
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
  name_area_conservation_priority: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostLocationData', message: 'params', obj });

    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
    this.is_within_overlapping = obj?.is_within_overlapping || 'N';
    this.region = obj?.region || null;
    this.number_sites = obj?.number_sites || null;
    this.size_ha = obj?.size_ha || null;
    this.name_area_conservation_priority =
      (obj?.name_area_conservation_priority?.length &&
        obj.name_area_conservation_priority.map((item: any) => {
          return {
            name_area_conservation_priority: item.name_area_conservation_priority
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
 * Processes POST /project partnerships data
 *
 * @export
 * @class PostPartnershipsData
 */
export class PostPartnershipsData {
  partnerships: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPartnershipsData', message: 'params', obj });

    this.partnerships = (obj?.partnerships.length && obj.partnerships) || [];
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
