import { GetReportLastData, GetReportPlanData, GetReportProjectData, GetReportUserData } from '../models/report-view';

export interface IGetReport {
  project: GetReportProjectData;
  plan: GetReportPlanData;
  user: GetReportUserData;
  last_created: GetReportLastData;
  last_updated: GetReportLastData;
}

export interface IGetAppReport {
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
