import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_ADMIN = process.env.DB_ADMIN;

export enum SYSTEM_IDENTITY_SOURCE {
  DATABASE = 'DATABASE',
  IDIR = 'IDIR',
  BCEID_BASIC = 'BCEIDBASIC',
  BCEID_BUSINESS = 'BCEIDBUSINESS'
}

export enum SYSTEM_USER_ROLE_ID {
  SYSTEM_ADMINISTRATOR = 1,
  CREATOR = 2,
  MAINTAINER = 3
}

const systemUsers = [
  {
    identifier: 'creatorcypress',
    type: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
    roleId: SYSTEM_USER_ROLE_ID.CREATOR
  },
  {
    identifier: 'dataadmincypress',
    type: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
    roleId: SYSTEM_USER_ROLE_ID.MAINTAINER
  },
  {
    identifier: 'systemadmincypress',
    type: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR
  }
];

/**
 * Insert users for cypress testing.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  // Update role
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA};
  `);

  for (const systemUser of systemUsers) {
    // check if user is already in the system users table
    const response = await knex.raw(`
      ${getSystemUserSQL(systemUser.identifier)}
    `);

    // if the fetch returns no rows, then the user is not in the system users table and should be added
    if (!response?.rows?.[0]) {
      // Add system user
      await knex.raw(`
        ${insertSystemUserSQL(systemUser.identifier, systemUser.type)}
      `);

      // Add system administrator role
      await knex.raw(`
        ${insertSystemUserRoleSQL(systemUser.identifier, systemUser.roleId)}
      `);
    }
  }
}

/**
 * SQL to fetch an existing system user row.
 *
 * @param {string} userIdentifier
 */
const getSystemUserSQL = (userIdentifier: string) => `
  SELECT
    user_identifier
  FROM
    system_user
  WHERE
    user_identifier = '${userIdentifier}';
`;

/**
 * SQL to insert a system user row.
 *
 * @param {string} userIdentifier
 * @param {string} userType
 */
const insertSystemUserSQL = (userIdentifier: string, userType: string) => `
  INSERT INTO system_user (
    user_identity_source_id,
    user_identifier,
    user_guid,
    record_effective_date,
    create_date,
    create_user
  )
  SELECT
    user_identity_source_id,
    '${userIdentifier}',
    null,
    now(),
    now(),
    (SELECT system_user_id from system_user where user_identifier = '${DB_ADMIN}')
  FROM
    user_identity_source
  WHERE
    name = '${userType}'
  AND
    record_end_date is null;
`;

/**
 * SQL to insert a system user role row.
 *
 * @param {string} userIdentifier
 * @param {number} roleId
 */
const insertSystemUserRoleSQL = (userIdentifier: string, roleId: number) => `
  INSERT INTO system_user_role (
    system_user_id,
    system_role_id
  ) VALUES (
    (SELECT system_user_id from system_user where user_identifier = '${userIdentifier}'),
    ${roleId}
  );
`;
