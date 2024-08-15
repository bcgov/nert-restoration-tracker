import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { PlanService } from '../../../services/plan-service';
import { viewPlan } from './view';

chai.use(sinonChai);

describe('viewPlan', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return a plan for view', async () => {
    const dbConnectionObj = getMockDBConnection();
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const plan = {
      id: 1,
      name: 'test plan',
      project: {
        id: 1,
        name: 'test project',
        is_first_nation: true
      },
      location: {
        geometry: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [0, 0]
            }
          }
        ],
        priority: 'true',
        region: 1
      }
    };

    mockReq.params = {
      planId: '1'
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(PlanService.prototype, 'getPlanById').resolves(plan as any);

    const requestHandler = viewPlan();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith(plan);
  });

  it('should catch and re-throw an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      planId: '1',
      keycloak_token: 'token'
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(PlanService.prototype, 'getPlanById').rejects(new Error('a test error'));

    const requestHandler = viewPlan();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (err: any) {
      expect(err.message).to.equal('a test error');
    }
  });
});
