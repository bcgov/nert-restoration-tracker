import { SQL, SQLStatement } from 'sql-template-strings';

export type DBSystemMetadataConstant = 'ORGANIZATION_NAME_FULL' | 'ORGANIZATION_URL';

export const getDbCharacterSystemMetaDataConstantSQL = (constantName: DBSystemMetadataConstant): SQLStatement =>
  SQL`SELECT api_get_character_system_metadata_constant(${constantName}) as constant;`;
