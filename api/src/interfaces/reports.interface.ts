import { GetReportLastData, GetReportPlanData, GetReportProjectData, GetReportUserData } from '../models/report-view';

export interface IGetReport {
  project: GetReportProjectData;
  plan: GetReportPlanData;
  user: GetReportUserData;
  last_created: GetReportLastData;
  last_updated: GetReportLastData;
}
