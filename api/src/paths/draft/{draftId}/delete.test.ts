import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import * as deleteDraftProject from './delete';

chai.use(sinonChai);

describe('delete a draft project', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      draftId: 1
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

  it('catches and rethrows errors', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      sinon.stub(dbConnectionObj, 'query').rejects(new Error('An error occurred'));

      const result = deleteDraftProject.deleteDraft();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect.fail();
    } catch (actualError: any) {
      expect(actualError.message).to.equal('An error occurred');
    }
  });

  it('should throw a 400 error when no draftId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = deleteDraftProject.deleteDraft();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, draftId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `draftId`');
    }
  });

  it('should return the row count of the removed draft project on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    const result = deleteDraftProject.deleteDraft();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql(1);
  });
});
