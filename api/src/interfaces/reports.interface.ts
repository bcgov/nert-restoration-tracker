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
