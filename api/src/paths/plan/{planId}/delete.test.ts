import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { SYSTEM_ROLE } from '../../../constants/roles';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import { PlanService } from '../../../services/plan-service';
import * as delete_plan from './delete';

chai.use(sinonChai);

describe('deletePlan', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(PlanService.prototype, 'deletePlan').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { planId: '1' };
    mockReq['system_user'] = { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] };

    try {
      const result = delete_plan.deletePlan();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('should throw an error when planId is missing', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const result = delete_plan.deletePlan();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: `planId`');
    }
  });

  it('should return true on successful delete', async () => {
    const dbConnectionObj = getMockDBConnection();
    const mockQuery = sinon.stub();

    // mock project query
    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { planId: '1' };
    mockReq['system_user'] = { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] };

    sinon.stub(PlanService.prototype, 'deletePlan').resolves();

    const result = delete_plan.deletePlan();

    await result(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.equal(true);
  });
});
