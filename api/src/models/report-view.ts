export class GetReportProjectData {
  published_projects: number;
  draft_projects: number;
  archived_projects: number;

  constructor(projectReportData?: any) {
    this.published_projects = projectReportData?.published_projects || null;
    this.draft_projects = projectReportData?.draft_projects || null;
    this.archived_projects = projectReportData?.archived_projects || null;
  }
}

export class GetReportPlanData {
  published_plans: number;
  draft_plans: number;
  archived_plans: number;

  constructor(planReportData?: any) {
    this.published_plans = planReportData?.published_plans || null;
    this.draft_plans = planReportData?.draft_plans || null;
    this.archived_plans = planReportData?.archived_plans || null;
  }
}

export class GetReportUserData {
  admins: number;
  maintainers: number;
  creators: number;

  constructor(userReportData?: any) {
    this.admins = userReportData?.admins || null;
    this.maintainers = userReportData?.maintainers || null;
    this.creators = userReportData?.creators || null;
  }
}

export interface GetReportLastData {
  project: GetReportLast;
  plan: GetReportLast;
}

export class GetReportLast {
  id: number | null;
  name: string | null;
  datetime: string | null;

  constructor(lastReportData?: any) {
    this.id = lastReportData?.id || null;
    this.name = lastReportData?.name || null;
    this.datetime = lastReportData?.datetime || null;
  }
}
