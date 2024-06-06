import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import * as viewDraftProject from './get';

chai.use(sinonChai);

describe('gets a draft project', () => {
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

  it('should return the draft project on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: 1 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    const result = viewDraftProject.getSingleDraft();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql({ id: 1 });
  });

  it('should return null if the draft project does not exist', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: undefined });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    const result = viewDraftProject.getSingleDraft();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql(null);
  });
});
