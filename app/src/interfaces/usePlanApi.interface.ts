import { IPlanContactForm } from 'features/plans/components/PlanContactForm';
import { IPlanGeneralInformationForm } from 'features/plans/components/PlanGeneralInformationForm';
import { IPlanLocationForm } from 'features/plans/components/PlanLocationForm';
import { Feature } from 'maplibre-gl';

// [OI] TODO This will need to be updated with Plan data model
export interface IPlanAdvancedFilterRequest {
  keyword?: string;
  contact_agency?: string | string[];
  funding_agency?: number | number[];
  permit_number?: string;
  species?: number | number[];
  start_date?: string;
  end_date?: string;
}

export interface ICreatePlanRequest
  extends IPlanGeneralInformationForm,
    IPlanContactForm,
    IPlanLocationForm {}

export interface IGetPlanForViewResponse {
  // [OI] this will require updating to the plan data model
  plan: IGetPlanForViewResponseDetails;
  contact: IGetPlanForViewResponseContact;
  location: IGetPlanForViewResponseLocation;
}

export interface IGetPlanForViewResponseDetails {
  state_code: number;
  is_project: boolean;
  project_id: number;
  project_name: string;
  start_date: string;
  end_date: string;
  publish_date: string;
  brief_desc: string;
  is_healing_land: boolean;
  is_healing_people: boolean;
  is_land_initiative: boolean;
  is_cultural_initiative: boolean;
  region: string;
}

export interface IGetPlanForViewResponseContactArrayItem {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  organization: string;
  first_nation_indigenous_affiliation: boolean;
  is_primary: string;
  is_public: string;
}

export interface IGetPlanForViewResponseContact {
  contacts: IGetPlanForViewResponseContactArrayItem[];
}

export interface IGetPlanForViewResponseLocation {
  geometry: Feature[];
  is_within_overlapping: string;
  region: number;
  number_sites: number;
  size_ha: number;
  name_area_conservation_priority: string[];
}
