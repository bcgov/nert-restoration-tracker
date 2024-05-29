import { IPlanContactForm } from 'features/plans/components/PlanContactForm';
import { IPlanGeneralInformationForm } from 'features/plans/components/PlanGeneralInformationForm';
import { IPlanLocationForm } from 'features/plans/components/PlanLocationForm';
import {
  IGetProjectForViewResponseContact,
  IGetProjectForViewResponseDetails,
  IGetProjectForViewResponseLocation
} from './useProjectApi.interface';
import { IPlanFocusForm } from 'features/plans/components/PlanFocusForm';

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
    IPlanFocusForm,
    IPlanContactForm,
    IPlanLocationForm {}

export interface IEditPlanRequest
  extends IPlanGeneralInformationForm,
    IPlanContactForm,
    IPlanLocationForm {}

export interface ICreatePlanResponse {
  project_id: number;
}

export interface IEditPlanResponse {
  project_id: number;
}
export interface IGetUserPlansListResponse {
  project_id: number;
  name: string;
  system_user_id: number;
  project_role_id: number;
  project_participation_id: number;
}

export interface IGetPlanForViewResponse {
  project: IGetProjectForViewResponseDetails;
  location: IGetProjectForViewResponseLocation;
  contact: IGetProjectForViewResponseContact;
}
