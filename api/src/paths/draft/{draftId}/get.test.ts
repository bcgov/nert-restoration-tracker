import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { DraftRepository } from '../../../repositories/draft-repository';
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

  it('catches and rethrows errors', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      sinon.stub(DraftRepository.prototype, 'getDraft').throws(new Error('An error occurred'));

      const result = viewDraftProject.getSingleDraft();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect.fail();
    } catch (actualError: any) {
      expect(actualError.message).to.equal('An error occurred');
    }
  });

  it('should return the draft project on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(DraftRepository.prototype, 'getDraft').resolves({ id: 1 } as any);

    const result = viewDraftProject.getSingleDraft();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql({ id: 1 });
  });

  it('should return null if the draft project does not exist', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(DraftRepository.prototype, 'getDraft').resolves(undefined);

    const result = viewDraftProject.getSingleDraft();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql(null);
  });
});
