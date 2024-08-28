import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { coerceIdentitySource, hasAtLeastOneValidValue } from './authUtils';

describe('authUtils', () => {
  // test coerceIdentitySource
  it('coerceIdentitySource', () => {
    expect(coerceIdentitySource(SYSTEM_IDENTITY_SOURCE.BCEID_BASIC)).toEqual('BCEIDBASIC');
    expect(coerceIdentitySource(SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS)).toEqual('BCEIDBUSINESS');
    expect(coerceIdentitySource(SYSTEM_IDENTITY_SOURCE.IDIR)).toEqual('IDIR');
    expect(coerceIdentitySource('')).toEqual(null);
  });

  // test hasAtLeastOneValidValue
  it('hasAtLeastOneValidValue', () => {
    expect(hasAtLeastOneValidValue('BCEID_BASIC', 'BCEID_BASIC')).toEqual(true);
    expect(hasAtLeastOneValidValue('BCEID_BASIC', 'BCEID_BUSINESS')).toEqual(false);
    expect(hasAtLeastOneValidValue('BCEID_BASIC', '')).toEqual(false);
    expect(hasAtLeastOneValidValue('', '')).toEqual(true);
  });
});
