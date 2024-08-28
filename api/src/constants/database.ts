/**
 * The identity source of the authenticated user.
 *
 * @export
 * @enum {number}
 */
export enum SYSTEM_IDENTITY_SOURCE {
  DATABASE = 'DATABASE',
  IDIR = 'IDIR',
  BCEID_BASIC = 'BCEIDBASIC',
  BCEID_BUSINESS = 'BCEIDBUSINESS',
  SYSTEM = 'SYSTEM'
}

/**
 * The source system for a dataset submission.
 *
 *
 * @export
 * @enum {number}
 */
export enum SOURCE_SYSTEM {
  'NERT-PUBLIC-5352' = 'nert-public-5352'
}
