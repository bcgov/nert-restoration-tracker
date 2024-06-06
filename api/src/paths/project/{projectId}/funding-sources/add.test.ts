import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../../__mocks__/db';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { ProjectService } from '../../../../services/project-service';
import * as addFunding from './add';

chai.use(sinonChai);

describe('add a funding source', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      id: 0,
      agency_id: 'agencyId',
      investment_action_category: 1,
      agency_project_id: 1,
      funding_amount: 1,
      start_date: '2021-01-01',
      end_date: '2021-01-01'
    },
    params: {
      projectId: 1
    }
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

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = addFunding.addFundingSource();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no request body present', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = addFunding.addFundingSource();

      await result({ ...sampleReq, body: null }, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing funding source data');
    }
  });

  it('should throw a 400 error when addFundingSource fails, because result has no rows', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(ProjectService.prototype, 'insertFundingSource').resolves(undefined);

    try {
      const result = addFunding.addFundingSource();

      await result(sampleReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert project funding source data');
    }
  });

  it('should return the new funding source id on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(ProjectService.prototype, 'insertFundingSource').resolves(1);

    const result = addFunding.addFundingSource();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql(1);
  });
});
