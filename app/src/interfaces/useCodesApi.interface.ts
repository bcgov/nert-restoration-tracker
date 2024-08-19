/**
 * A single code value.
 *
 * @export
 * @interface ICode
 */
export interface ICode {
  id: number;
  name: string;
}

/**
 * A code set (an array of ICode values).
 */
export type CodeSet<T extends ICode = ICode> = T[];

/**
 * Get all codes response object.
 *
 * @export
 * @interface IGetAllCodeSetsResponse
 */
export interface IGetAllCodeSetsResponse {
  branding: CodeSet<{ id: number; name: string; value: string }>;
  first_nations: CodeSet;
  funding_source: CodeSet;
  investment_action_category: CodeSet<{ id: number; fs_id: number; name: string }>;
  regions: CodeSet;
  species: CodeSet;
  system_roles: CodeSet;
  project_roles: CodeSet;
  administrative_activity_status_type: CodeSet;
  authorization_type: CodeSet;
}
