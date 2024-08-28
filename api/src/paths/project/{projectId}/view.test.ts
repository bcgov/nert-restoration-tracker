import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { ProjectService } from '../../../services/project-service';
import { viewProject } from './view';

chai.use(sinonChai);

describe('project/{projectId}/view', () => {
  describe('viewProject', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('fetches a project', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const viewProjectResult = { id: 1, location: { geometry: [] } };
      sinon.stub(ProjectService.prototype, 'getProjectById').resolves(viewProjectResult as any);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = viewProject();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql(viewProjectResult);
    });

    it('catches and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(ProjectService.prototype, 'getProjectById').throws(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = viewProject();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
      } catch (err: any) {
        expect(err.message).to.equal('a test error');
      }
    });
  });
});
