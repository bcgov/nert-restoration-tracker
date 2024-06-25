import {
  PostAuthorizationData,
  PostContactData,
  PostFocusData,
  PostFundingData,
  PostIUCNData,
  PostLocationData,
  PostObjectivesData,
  PostPartnershipsData,
  PostProjectData,
  PostRestPlanData,
  PostSpeciesData
} from './project-create';
import {
  GetAuthorizationData,
  GetContactData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetProjectData,
  GetSpeciesData
} from './project-view';

export type ProjectUpdateObject = {
  project: GetProjectData;
  species: GetSpeciesData;
  iucn: GetIUCNClassificationData;
  contact: GetContactData;
  authorization: GetAuthorizationData;
  partnerships: GetPartnershipsData;
  objective: GetObjectivesData;
  funding: GetFundingData;
  location: GetLocationData;
};

export class PutProjectObject {
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

export class PutProjectData {
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
