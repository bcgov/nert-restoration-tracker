import { ICreateProjectRequest } from './useProjectPlanApi.interface';

/**
 * Create/Update draft response object.
 *
 * @export
 * @interface IDraftResponse
 */
export interface IDraftResponse {
  id: number;
  date: string;
}

/**
 * Get drafts list response object.
 *
 * @export
 * @interface IGetDraftsListResponse
 */
export interface IGetDraftsListResponse {
  id: number;
  is_project: boolean;
  name: string;
}

/**
 * Get single draft response object.
 *
 * @export
 * @interface IGetDraftResponse
 */
export interface IGetDraftResponse {
  id: number;
  is_project: boolean;
  name: string;
  data: ICreateProjectRequest;
}
