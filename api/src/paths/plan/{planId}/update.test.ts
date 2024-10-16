import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import { PlanService } from '../../../services/plan-service';
import * as update from './update';

chai.use(sinonChai);

describe('update', () => {
  describe('updatePlan', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no req body', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = null;

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const requestHandler = update.updatePlan();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required path parameter: planId');
      }
    });

    it('should throw a 400 error when no projectId', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        planId: ''
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const requestHandler = update.updatePlan();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required path parameter: planId');
      }
    });

    it('updates a plan with all valid entries and returns 200 on success', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        planId: '1'
      };

      mockReq.body = {
        project: {
          project_id: 1,
          project_name: 'Project 1',
          start_date: '2022-02-02',
          end_date: '2022-02-30',
          objectives: 'my objectives',
          publish_date: '2022-02-02',
          revision_count: 0
        },
        contact: {},
        authorization: {},
        funding: {},
        partnerships: {},
        objectives: {},
        location: {}
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(PlanService.prototype, 'updatePlan').resolves();

      const requestHandler = update.updatePlan();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
    });
  });

  describe('viewPlanForEdit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return a plan for editing', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        planId: '1'
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(PlanService.prototype, 'getPlanByIdForEdit').resolves({ id: 1 } as any);

      const requestHandler = update.viewPlanForEdit();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql({ id: 1 });
    });

    it('should catch and re-throw an error', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        planId: '1'
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(PlanService.prototype, 'getPlanByIdForEdit').rejects(new Error('a test error'));

      const requestHandler = update.viewPlanForEdit();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
