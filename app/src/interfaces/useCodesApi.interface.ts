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
  branding: CodeSet<IBrandingCode>;
  first_nations: CodeSet;
  regions: CodeSet;
  system_roles: CodeSet;
  project_roles: CodeSet;
  administrative_activity_status_type: CodeSet;
  authorization_type: CodeSet;
  partnership_type: CodeSet;
  partnerships: CodeSet<IPartnershipCode>;
}
export interface IPartnershipCode {
  id: number;
  type_id: number;
  name: string;
}

export interface IBrandingCode {
  id: number;
  name: string;
  value: string;
}

export type CombinedCode = IBrandingCode | IPartnershipCode | ICode;

export enum CodeType {
  FIRST_NATIONS = 'first_nations',
  SYSTEM_ROLES = 'system_roles',
  PROJECT_ROLES = 'project_roles',
  ADMINISTRATIVE_ACTIVITY_STATUS_TYPE = 'administrative_activity_status_type',
  BRANDING = 'branding',
  AUTHORIZATION_TYPE = 'authorization_type',
  PARTNERSHIP_TYPE = 'partnership_type',
  PARTNERSHIPS = 'partnerships'
}

export const isBrandingCode = (code: CombinedCode): code is IBrandingCode => {
  return (code as IBrandingCode).value !== undefined;
};

export const isPartnershipCode = (code: CombinedCode): code is IPartnershipCode => {
  return (code as IPartnershipCode).type_id !== undefined;
};

export const checkCodeType = (code: CombinedCode) => {
  if (isBrandingCode(code)) {
    return code.value;
  } else if (isPartnershipCode(code)) {
    return code.type_id;
  } else {
    return code.id;
  }
};
