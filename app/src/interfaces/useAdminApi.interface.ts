export type IIDIRAccessRequestDataObject = {
  role: number;
  reason: string;
};

export type IBCeIDBasicAccessRequestDataObject = {
  reason: string;
};

export type IBCeIDBusinessAccessRequestDataObject = {
  company: string;
  reason: string;
};

export type IAccessRequestDataObject = {
  name: string;
  userGuid: string | null;
  username: string;
  email: string;
  identitySource: string;
  displayName: string;
} & (
  | IIDIRAccessRequestDataObject
  | IBCeIDBasicAccessRequestDataObject
  | IBCeIDBusinessAccessRequestDataObject
);

export interface IGetAccessRequestsListResponse {
  id: number;
  type: number;
  type_name: string;
  status: number;
  status_name: string;
  description: string;
  notes: string;
  create_date: string;
  data: IAccessRequestDataObject;
}

export interface IGetAdministrativeActivityStanding {
  has_pending_access_request: boolean;
  has_one_or_more_project_roles: boolean;
}

export interface IgcNotifyGenericMessage {
  subject: string;
  header: string;
  main_body1: string;
  main_body2: string;
  footer: string;
}

export interface IgcNotifyRecipient {
  emailAddress: string;
  phoneNumber: string;
  userId: number;
}

interface IGetReportProjectData {
  published_projects: number;
  draft_projects: number;
  archived_projects: number;
}

interface IGetReportPlanData {
  published_plans: number;
  draft_plans: number;
  archived_plans: number;
}

interface IGetReportUserData {
  admins: number;
  maintainers: number;
  creators: number;
}

interface IGetReportLast {
  id: number;
  name: string;
  datetime: string;
}

interface IGetReportLastData {
  project: IGetReportLast;
  plan: IGetReportLast;
}
export interface IGetReport {
  project: IGetReportProjectData;
  plan: IGetReportPlanData;
  user: IGetReportUserData;
  last_created: IGetReportLastData;
  last_updated: IGetReportLastData;
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

export interface IGetPiMgmtReport {
  project_id: number;
  project_name: string;
  is_project: boolean;
  user_name: string;
  date: string;
  operation: string;
  file_name: string;
  file_type: string;
}

export interface IGetCustomReportData {
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
  objective: string[];
  contacts: string[];
  attachments: string[];
  funding_sources: string[];
  conservation_areas: string[];
  mgmt_region_id: number;
  spatial_type_name: string;
  overlaps_conservation_area: string;
  number_sites: number;
  size_ha: number;
  spatial_create_date: string;
  authorizations: string[];
  partnerships: string[];
  species: string[];
}
