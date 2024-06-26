import { Feature } from 'geojson';

export type ProjectObject = {
  project: GetProjectData;
  species: GetSpeciesData;
  iucn: GetIUCNClassificationData;
  contact: GetContactData;
  authorization: GetAuthorizationData;
  partnership: GetPartnershipsData;
  objective: GetObjectivesData;
  funding: GetFundingData;
  location: GetLocationData;
};

export class GetProjectData {
  project_id: number;
  is_project: boolean;
  uuid: string;
  project_name: string;
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
  publish_date: string;
  revision_count: number;

  constructor(projectData?: any) {
    this.project_id = projectData?.project_id || null;
    this.is_project = projectData?.is_project || null;
    this.uuid = projectData?.uuid || null;
    this.project_name = projectData?.name || '';
    this.state_code = projectData?.state_code || null;
    this.start_date = projectData?.start_date || null;
    this.end_date = projectData?.end_date || null;
    this.actual_start_date = projectData?.actual_start_date || null;
    this.actual_end_date = projectData?.actual_end_date || null;
    this.brief_desc = projectData?.brief_desc || '';
    this.is_healing_land = projectData?.is_healing_land || null;
    this.is_healing_people = projectData?.is_healing_people || null;
    this.is_land_initiative = projectData?.is_land_initiative || null;
    this.is_cultural_initiative = projectData?.is_cultural_initiative || null;
    this.people_involved = projectData?.people_involved || null;
    this.is_project_part_public_plan = projectData?.is_project_part_public_plan || null;
    this.publish_date = projectData?.publish_timestamp || null;
    this.revision_count = projectData?.revision_count ?? 0;
  }
}

interface IGetContact {
  first_name: string;
  last_name: string;
  email_address: string;
  organization: string;
  phone_number: string;
  is_public: string;
  is_primary: string;
}

export class GetContactData {
  contacts: IGetContact[];

  constructor(contactData?: any[]) {
    this.contacts =
      (contactData &&
        contactData.map((item: any) => {
          return {
            first_name: item.first_name || '',
            last_name: item.last_name || '',
            email_address: item.email_address || '',
            organization: item.organization || '',
            phone_number: item.phone_number || '',
            is_public: item.is_public === 'Y' ? 'true' : 'false',
            is_primary: item.is_primary === 'Y' ? 'true' : 'false'
          };
        })) ||
      [];
  }
}

export class GetSpeciesData {
  focal_species: number[];
  focal_species_names: string[];

  constructor(input?: any[]) {
    this.focal_species = [];
    this.focal_species_names = [];
    input?.length &&
      input.forEach((item: any) => {
        this.focal_species.push(Number(item.id));
        this.focal_species_names.push(item.label);
      });
  }
}

export interface IGetAuthorization {
  authorization_ref: string;
  authorization_type: string;
}

export class GetAuthorizationData {
  authorizations: IGetAuthorization[];

  constructor(authData?: any[]) {
    this.authorizations =
      (authData?.length &&
        authData.map((item: any) => {
          return {
            authorization_ref: item.number,
            authorization_type: item.type
          };
        })) ||
      [];
  }
}

export interface IGetPartnership {
  partnership: string;
}
export class GetPartnershipsData {
  partnerships: IGetPartnership[];

  constructor(partnerships?: any[]) {
    this.partnerships = (partnerships?.length && partnerships.map((item: any) => item)) || [];
  }
}

export interface IGetObjective {
  objective: string;
}
export class GetObjectivesData {
  objectives: IGetObjective[];

  constructor(objectives?: IGetObjective[]) {
    this.objectives = (objectives?.length && objectives.map((item: IGetObjective) => item)) || [];
  }
}

export interface IGetConservationArea {
  conservationArea: string;
}

export class GetLocationData {
  geometry?: Feature[];
  is_within_overlapping?: string;
  region?: number;
  number_sites?: number;
  size_ha?: number;
  conservationAreas?: IGetConservationArea[];

  constructor(locationData?: any[], regionData?: any[], conservationAreaData?: IGetConservationArea[]) {
    const locationDataItem = locationData && locationData.length && locationData[0];
    this.geometry = (locationDataItem?.geojson?.length && locationDataItem.geojson) || [];
    this.is_within_overlapping = locationData && locationData?.length && locationData[0]?.is_within_overlapping;
    this.region = (regionData && regionData?.length && regionData[0]?.objectid) || ('' as unknown as number);
    this.number_sites =
      (locationData && locationData?.length && locationData[0]?.number_sites) || ('' as unknown as number);
    this.size_ha = (locationData && locationData?.length && locationData[0]?.size_ha) || ('' as unknown as number);
    this.conservationAreas = (conservationAreaData && conservationAreaData?.length && conservationAreaData) || [];
  }
}

interface IGetIUCN {
  classification: string;
  subClassification1: string;
  subClassification2: string;
}

export class GetIUCNClassificationData {
  classificationDetails: IGetIUCN[];

  constructor(iucnClassificationData?: any[]) {
    this.classificationDetails =
      (iucnClassificationData &&
        iucnClassificationData.map((item: any) => {
          return {
            classification: item.classification,
            subClassification1: item.subclassification1,
            subClassification2: item.subclassification2
          };
        })) ||
      [];
  }
}

interface IGetFundingSource {
  agency_id: number;
  investment_action_category: number;
  description: string;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  is_public: string;
}

export class GetFundingData {
  fundingSources: IGetFundingSource[];

  constructor(fundingData?: any[]) {
    this.fundingSources =
      (fundingData &&
        fundingData.map((item: any) => {
          return {
            agency_id: item.agency_id,
            investment_action_category: item.investment_action_category,
            description: item.description,
            agency_project_id: item.agency_project_id,
            funding_amount: item.funding_amount,
            start_date: item.start_date,
            end_date: item.end_date,
            is_public: 'false'
          };
        })) ||
      [];
  }
}
