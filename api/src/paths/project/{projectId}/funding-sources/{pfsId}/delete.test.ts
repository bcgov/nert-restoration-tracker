import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { ProjectService } from '../../../../../services/project-service';
import * as deleteFundingSource from './delete';

chai.use(sinonChai);

describe('delete a funding source', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1,
      pfsId: 1
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
      const result = deleteFundingSource.deleteFundingSource();
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

  it('should throw a 400 error when no pfsId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = deleteFundingSource.deleteFundingSource();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, pfsId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `pfsId`');
    }
  });

  it('should return the row count of the removed funding source on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(ProjectService.prototype, 'deleteFundingSourceById').resolves({ project_funding_source_id: 1 });

    const result = deleteFundingSource.deleteFundingSource();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql({ id: 1 });
  });

  it('catches errors and returns 500 on failure', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(ProjectService.prototype, 'deleteFundingSourceById').throws(new Error('error message'));

    try {
      const result = deleteFundingSource.deleteFundingSource();
      await result(sampleReq, sampleRes as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('error message');
    }
  });

  it('throws a 400 error when the funding source is not found', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(ProjectService.prototype, 'deleteFundingSourceById').resolves(undefined);

    try {
      const result = deleteFundingSource.deleteFundingSource();
      await result(sampleReq, sampleRes as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to delete project funding source');
    }
  });
});
