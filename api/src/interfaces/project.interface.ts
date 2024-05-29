import { Feature } from 'geojson';
import { PostContactData, PostFocusData, PostLocationData, PostPlanData } from '../models/project-create';
import { GetContactData, GetLocationData, GetProjectData } from '../models/project-view';

export interface ICreatePlan {
  project: PostPlanData;
  focus: PostFocusData;
  contact: PostContactData;
  location: PostLocationData;
}

export interface IEditPlan {
  project: PostPlanData;
  contact: PostContactData;
  location: PostLocationData;
}

export interface IGetPlan {
  project: GetProjectData;
  contact: GetContactData;
  location: GetLocationData;
}

export interface IPlan {
  project: IProject;
  contact: IContact;
  location: ILocation;
}

export interface IProject {
  project_id?: number;
  is_project: boolean;
  uuid?: string;
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
  publish_date?: string;
  revision_count?: number;
}

export interface IContact {
  contacts: IContact[];
}

export interface IContact {
  first_name: string;
  last_name: string;
  email_address: string;
  agency: string;
  is_public: boolean;
  is_primary: boolean;
}

export interface ILocation {
  geometry: Feature[];
  is_within_overlapping?: string;
  region?: number;
  number_sites?: number;
  size_ha?: number;
}
