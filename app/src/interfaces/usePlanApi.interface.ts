import { IPlanContactForm } from 'features/plans/components/PlanContactForm';
import { IPlanFocusForm } from 'features/plans/components/PlanFocusForm';
import { IPlanGeneralInformationForm } from 'features/plans/components/PlanGeneralInformationForm';
import { IPlanLocationForm } from 'features/plans/components/PlanLocationForm';
import {
  IGetProjectForEditResponseDetails,
  IGetProjectForViewResponseContact,
  IGetProjectForViewResponseDetails,
  IGetProjectForViewResponseLocation
} from './useProjectApi.interface';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';

// [OI] TODO This will need to be updated with Plan data model
export interface IPlanAdvancedFilterRequest {
  plan_keyword?: string;
  plan_name?: string;
  plan_status?: string | string[];
  plan_region?: string | string[];
  plan_focus?: string | string[];
  plan_start_date?: string;
  plan_end_date?: string;
  plan_organizations?: string;
  plan_ha_to?: string;
  plan_ha_from?: string;
}

export interface ICreatePlanRequest
  extends IPlanGeneralInformationForm,
    IPlanFocusForm,
    IPlanContactForm,
    IPlanLocationForm {}

export interface IEditPlanRequest
  extends IPlanGeneralInformationForm,
    IPlanFocusForm,
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

export interface IGetPlanForEditResponse {
  project: IGetProjectForEditResponseDetails;
  focus: { focuses: IMultiAutocompleteFieldOption[] };
  location: IGetProjectForViewResponseLocation;
  contact: IGetProjectForViewResponseContact;
}
