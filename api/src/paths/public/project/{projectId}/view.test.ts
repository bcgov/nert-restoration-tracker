import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { ProjectService } from '../../../../services/project-service';
import { getPublicProjectForView } from './view';

chai.use(sinonChai);

describe('project/{projectId}/view', () => {
  describe('viewPublicProject', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('fetches a project', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const viewProjectResult = { id: 1, location: { geometry: [] } };
      sinon.stub(ProjectService.prototype, 'getProjectById').resolves(viewProjectResult as any);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const requestHandler = getPublicProjectForView();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql(viewProjectResult);
    });
    it('catches and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(ProjectService.prototype, 'getProjectById').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getPublicProjectForView();
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
