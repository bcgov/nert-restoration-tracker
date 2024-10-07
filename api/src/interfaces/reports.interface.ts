import { GetReportLastData, GetReportPlanData, GetReportProjectData, GetReportUserData } from '../models/report-view';

export interface IGetReport {
  project: GetReportProjectData;
  plan: GetReportPlanData;
  user: GetReportUserData;
  last_created: GetReportLastData;
  last_updated: GetReportLastData;
}

export interface IGetAppUserReport {
  user_id: number;
  user_name: string;
  role_names: string[];
  prj_count: string;
  plan_count: string;
  arch_prj_count: string;
  arch_plan_count: string;
  draft_prj_count: string;
  draft_plan_count: string;
}

export interface IGetPIMgmtReport {
  project_id: number;
  project_name: string;
  is_project: boolean;
  user_name: string;
  date: string;
  operation: string;
  file_name: string;
  file_type: string;
}

export interface IGetCustomReport {
  id: number;
  is_project: boolean;
  name: string;
  brief_desc: string;
  start_date: string;
  end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  state_code: number;
  people_involved: number;
  is_healing_land: boolean;
  is_healing_people: boolean;
  is_land_initiative: boolean;
  is_cultural_initiative: boolean;
  is_project_part_public_plan: boolean;
  create_date: string;
  create_user_name: string;
  update_date: string;
  update_user_name: string;
  objective: string;
  contacts: string;
}
