import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import { PlanService } from '../../../services/plan-service';
import { GET, viewPlan } from './view';

chai.use(sinonChai);

describe('plan/{planId}/view', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(GET.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('viewPlan', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches a project', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const viewPlanResult = { id: 1 };

      sinon.stub(PlanService.prototype, 'getPlanById').resolves(viewPlanResult as any);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = viewPlan();

        await requestHandler(mockReq, mockRes, mockNext);
      } catch (actualError) {
        expect.fail();
      }

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql(viewPlanResult);
    });

    it('catches and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(PlanService.prototype, 'getPlanById').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = viewPlan();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
