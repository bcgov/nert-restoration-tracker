import { PROJECT_PERMISSION, PROJECT_ROLE } from 'constants/roles';
import { IProjectAuthorizationForm } from 'features/projects/components/ProjectAuthorizationForm';
import { IProjectContactForm } from 'features/projects/components/ProjectContactForm';
import { IProjectFocusForm } from 'features/projects/components/ProjectFocusForm';
import { IProjectFundingForm } from 'features/projects/components/ProjectFundingForm';
import { IProjectGeneralInformationForm } from 'features/projects/components/ProjectGeneralInformationForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { IProjectPartnershipsForm } from 'features/projects/components/ProjectPartnershipsForm';
import { IProjectRestorationPlanForm } from 'features/projects/components/ProjectRestorationPlanForm';
import { IProjectWildlifeForm } from 'features/projects/components/ProjectFocalSpeciesForm';
import { Feature } from 'geojson';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';

export interface IGetProjectAttachment {
  id: number;
  fileName: string;
  lastModified: string;
  size: number;
  url: string;
}

/**
 * An interface for an instance of filter fields for project advanced filter search
 */
export interface IProjectAdvancedFilterRequest {
  keyword?: string;
  permit_number?: string;
  species?: number | number[];
  start_date?: string;
  end_date?: string;
}

/**
 * Get project attachments response object.
 *
 * @export
 * @interface IGetProjectAttachmentsResponse
 */
export interface IGetProjectAttachmentsResponse {
  attachmentsList: IGetProjectAttachment[];
}

/**
 * Get projects list response object.
 *
 * @export
 * @interface IGetUserProjectsListResponse
 */
export interface IGetUserProjectsListResponse {
  project_id: number;
  name: string;
  system_user_id: number;
  project_role_id: number;
  project_participation_id: number;
}

/**
 * Get projects list response object.
 *
 * @export
 * @interface IGetProjectsListResponse
 */
export interface IGetProjectsListResponse {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  contact_agency_list: string;
  permits_list: string;
}

/**
 * Create project response object.
 *
 * @export
 * @interface ICreateProjectResponse
 */
export interface ICreateProjectResponse {
  id: number;
}

/**
 * Create project post object.
 *
 * @export
 * @interface ICreateProjectRequest
 */
export interface ICreateProjectRequest
  extends IProjectGeneralInformationForm,
    IProjectObjectivesForm,
    IProjectFocusForm,
    IProjectContactForm,
    IProjectWildlifeForm,
    IProjectAuthorizationForm,
    IProjectFundingForm,
    IProjectPartnershipsForm,
    IProjectRestorationPlanForm,
    IProjectLocationForm {
  [key: string]: any;
}

export interface IEditProjectRequest
  extends IProjectGeneralInformationForm,
    IProjectObjectivesForm,
    IProjectFocusForm,
    IProjectAuthorizationForm,
    IProjectContactForm,
    IProjectWildlifeForm,
    IProjectAuthorizationForm,
    IProjectFundingForm,
    IProjectPartnershipsForm,
    IProjectRestorationPlanForm,
    IProjectLocationForm {}

export interface IProjectsListProps {
  projects: IGetProjectForViewResponse[];
  drafts?: IGetDraftsListResponse[];
  myproject?: boolean;
}

/**
 * An interface for a single instance of project metadata, for view-only use cases.
 *
 * @export
 * @interface IGetProjectForViewResponse
 */
export interface IGetProjectForViewResponse {
  project: IGetProjectForViewResponseDetails;
  species: IGetProjectForViewResponseSpecies;
  authorization: IGetProjectForViewResponseAuthorization;
  location: IGetProjectForViewResponseLocation;
  contact: IGetProjectForViewResponseContact;
  iucn: IGetProjectForViewResponseIUCN;
  funding: IGetProjectForViewResponseFundingData;
  partnership: IGetProjectForViewResponsePartnerships;
  objective: IGetProjectForViewResponseObjectives;
}

export interface IGetProjectForEditResponse {
  project: IGetProjectForEditResponseDetails;
  objective: IGetProjectForViewResponseObjectives;
  focus: { focuses: number[]; people_involved: number };
  contact: IGetProjectForViewResponseContact;
  species: IGetProjectForViewResponseSpecies;
  location: IGetProjectForViewResponseLocation;
  authorization: IGetProjectForViewResponseAuthorization;
  iucn: IGetProjectForViewResponseIUCN;
  funding: IGetProjectForViewResponseFundingData;
  partnership: IGetProjectForViewResponsePartnerships;
  restoration_plan: { is_project_part_public_plan: boolean };
}

export interface IGetProjectForViewResponseDetails {
  state_code: number;
  is_project: boolean;
  project_id: number;
  project_name: string;
  start_date: string;
  end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  publish_date: string;
  brief_desc: string;
  is_healing_land: boolean;
  is_healing_people: boolean;
  is_land_initiative: boolean;
  is_cultural_initiative: boolean;
  people_involved: number;
  is_project_part_public_plan: boolean;
  region: string;
}

export interface IGetProjectForEditResponseDetails {
  state_code: number;
  is_project: boolean;
  project_id: number;
  project_name: string;
  start_date: string;
  end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  publish_date: string;
  brief_desc: string;
  is_healing_land: boolean;
  is_healing_people: boolean;
  is_land_initiative: boolean;
  is_cultural_initiative: boolean;
  people_involved: number;
  is_project_part_public_plan: boolean;
  region: string;
  image_url: string;
  image_key: string;
}

export interface IGetProjectForViewResponseSpecies {
  focal_species: number[];
  focal_species_names?: string[];
}

interface IGetProjectForViewResponsePermitArrayItem {
  permit_number: string;
  permit_type: string;
  permit_description: string;
}

export interface IGetProjectForViewResponsePermit {
  permits: IGetProjectForViewResponsePermitArrayItem[];
}

export interface IGetProjectForViewResponseConservationAreas {
  conservationArea: string;
}

export interface IGetProjectForViewResponseLocation {
  geometry: Feature[];
  is_within_overlapping: string;
  region: number;
  number_sites: number;
  size_ha: number;
  conservationAreas: IGetProjectForViewResponseConservationAreas[];
}

export interface IGetProjectForViewResponseContactArrayItem {
  first_name: string;
  last_name: string;
  email_address: string;
  organization: string;
  phone_number: string;
  is_public: string;
  is_primary: string;
}

export interface IGetProjectForViewResponseContact {
  contacts: IGetProjectForViewResponseContactArrayItem[];
}

interface IGetProjectForViewResponseIUCNArrayItem {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export interface IGetProjectForViewResponseIUCN {
  classificationDetails: IGetProjectForViewResponseIUCNArrayItem[];
}

export interface IGetProjectForViewResponseFundingSource {
  organization_name: string;
  investment_action_category: number;
  description: string;
  funding_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  is_public: string;
}

export interface IGetProjectForViewResponseFundingData {
  fundingSources: IGetProjectForViewResponseFundingSource[];
}

export interface IGetProjectForViewResponsePartnershipsArrayItem {
  partnership: string;
}
export interface IGetProjectForViewResponsePartnerships {
  partnerships: IGetProjectForViewResponsePartnershipsArrayItem[];
}

export interface IGetProjectForViewResponseObjectives {
  objectives: { objective: string }[];
}

export interface IGetProjectForViewResponseAuthorization {
  authorizations: {
    authorization_ref: string;
    authorization_type: string;
    authorization_desc: string;
  }[];
}
/**
 * A single media item.
 *
 * @export
 * @interface IGetProjectMediaListResponse
 */
export interface IGetProjectMediaListResponse {
  file_name: string;
  encoded_file: string;
}

/**
 * A  file upload response.
 *
 * @export
 * @interface IUploadAttachmentResponse
 */
export interface IUploadAttachmentResponse {
  attachmentId: number;
  revision_count: number;
}

export interface IGetProjectParticipantsResponseArrayItem {
  project_participation_id: number;
  project_id: number;
  system_user_id: number;
  project_role_id: number;
  project_role_name: string;
  user_identifier: string;
  user_identity_source_id: number;
}
export interface IGetProjectParticipantsResponse {
  participants: IGetProjectParticipantsResponseArrayItem[];
}

export interface IAddProjectParticipant {
  userIdentifier: string;
  identitySource: string;
  roleId: number;
}

export interface IGetProjectParticipant {
  project_participation_id: number;
  project_id: number;
  system_user_id: number;
  identity_source: string;
  user_identifier: string;
  email: string | null;
  display_name: string;
  agency: string | null;
  project_role_ids: number[];
  project_role_names: string[];
  project_role_permissions: string[];
}

export type IGetUserProjectParticipantResponse = {
  project_id: number;
  system_user_id: number;
  project_role_ids: number[];
  project_role_names: PROJECT_ROLE[];
  project_role_permissions: PROJECT_PERMISSION[];
} | null;
