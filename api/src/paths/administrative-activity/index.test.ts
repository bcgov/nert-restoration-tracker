import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { AdministrativeActivityService } from '../../services/administrative-activity-service';
import * as keycloak_utils from '../../utils/keycloak-utils';
import * as administrative_activity from './index';

chai.use(sinonChai);

describe('updateAccessRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw a 400 error when no system user id', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return null as unknown as number;
      }
    });

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
    }
  });

  it('should return id of success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(AdministrativeActivityService.prototype, 'createPendingAccessRequest').resolves({
      id: 1,
      date: '2020/04/04'
    } as any);

    const result = administrative_activity.createAdministrativeActivity();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql({
      id: 1,
      date: '2020/04/04'
    });
  });
});

describe('getAdministrativeActivityStanding', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw a 400 error when no user identifier', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns(null as unknown as string);

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = administrative_activity.getAdministrativeActivityStanding();

      await result(sampleReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required userIdentifier');
    }
  });

  it('should return 0 on success (no rowCount)', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns('identifier');

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(AdministrativeActivityService.prototype, 'getAdministrativeActivityStanding')
      .resolves({ has_pending_access_request: false, has_one_or_more_project_roles: false } as any);

    const result = administrative_activity.getAdministrativeActivityStanding();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql({ has_pending_access_request: false, has_one_or_more_project_roles: false });
  });

  it('should return rowCount on success', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns('identifier');

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(AdministrativeActivityService.prototype, 'getAdministrativeActivityStanding')
      .resolves({ has_pending_access_request: false, has_one_or_more_project_roles: true });

    const result = administrative_activity.getAdministrativeActivityStanding();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql({ has_pending_access_request: false, has_one_or_more_project_roles: true });
  });
});
