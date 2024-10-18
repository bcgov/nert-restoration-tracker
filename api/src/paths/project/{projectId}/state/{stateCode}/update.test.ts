import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { ProjectService } from '../../../../../services/project-service';
import * as update from './update';

chai.use(sinonChai);

describe('updateState', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      stateCode: 1
    },
    body: {}
  } as any;

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

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = update.updateState();

      await result(
        { ...mockReq, params: { ...mockReq.params, projectId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param projectId or state');
    }
  });

  it('should throw an error when stateCode is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = update.updateState();

      await result(
        { ...mockReq, params: { ...mockReq.params, stateCode: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param projectId or state');
    }
  });

  it('should return a 200 response', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(ProjectService.prototype, 'updateStateCode').resolves({ id: 1 });

    const result = update.updateState();

    await result(mockReq, mockRes as any, null as unknown as any);
    expect(actualResult).to.eql({ id: 1 });
  });

  it('catches and returns a 500 error', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const updateStateStub = sinon
      .stub(ProjectService.prototype, 'updateStateCode')
      .throws(new Error('An error occurred'));

    try {
      const result = update.updateState();

      await result(mockReq, mockRes as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect(updateStateStub).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('An error occurred');
    }
  });
});
