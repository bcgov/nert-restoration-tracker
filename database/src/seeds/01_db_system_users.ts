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
    identifier: 'oinostro',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: '5134A2E785814352A291886CD5F53CD1'
  },
  {
    identifier: 'oscar-bc-adm',
    type: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: 'DCDDBF25F13345EAA9F56BFD1A4F4EA7'
  },
  {
    identifier: 'oscar-bc',
    type: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
    roleId: SYSTEM_USER_ROLE_ID.CREATOR,
    user_guid: '51DCDD7A8CAF43F2ADA3C197E883BF77'
  },
  {
    identifier: 'jrpopkin',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: 'C8659F561DC244AE9D7EDE7F08E25512'
  },
  {
    identifier: 'keinarss',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: 'F4663727DE89489C8B7CFA81E4FA99B3'
  },
  {
    identifier: 'kjartane',
    type: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
    roleId: SYSTEM_USER_ROLE_ID.CREATOR,
    user_guid: '6F76D664023A4EABAD52B95512D6607C'
  },
  {
    identifier: 'hdave',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: '1983DA9AA0F046A180D314D0F9CC0B15'
  }
];

/**
 * Insert system_user rows for each member of the development team if they don't already exist in the system user table.
 *
 * Note: This seed will only be necessary while there is no in-app functionality to manage users.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA};
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
        ${insertSystemUserSQL(systemUser.identifier, systemUser.type, systemUser.user_guid.toLowerCase())}
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
const insertSystemUserSQL = (userIdentifier: string, userType: string, userGuid: string) => `
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
    '${userGuid.toLowerCase()}',
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
