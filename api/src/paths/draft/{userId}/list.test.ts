import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import { DraftRepository } from '../../../repositories/draft-repository';
import * as list from './list';

describe('getUserDraftsList', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      userId: 1
    }
  } as any;

  const mockRowObj = [
    { id: 1, name: 'draft name', is_project: false },
    { id: 2, name: 'draft name 2', is_project: false }
  ];

  let actualResult: any = null;

  const mockRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  } as any;

  it('throws error if userId is empty', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = list.getUserDraftsList();

      await result({ ...mockReq, params: { userId: null } }, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Missing required path param `userId`');
    }
  });

  it('should throw a 400 error when no list is returned', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(DraftRepository.prototype, 'getDraftList').resolves(undefined);

    try {
      const result = list.getUserDraftsList();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get user drafts list');
    }
  });

  it('should return a list of drafts', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(DraftRepository.prototype, 'getDraftList').resolves(mockRowObj);

    const result = list.getUserDraftsList();

    await result(mockReq, mockRes, null as unknown as any);

    expect(actualResult).to.eql(mockRowObj);
  });
});
