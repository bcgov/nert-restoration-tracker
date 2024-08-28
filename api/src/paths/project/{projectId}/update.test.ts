import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import { ProjectService } from '../../../services/project-service';
import * as update from './update';

chai.use(sinonChai);

describe('update', () => {
  describe('updateProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no req body', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = null;

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const requestHandler = update.updateProject();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required path parameter: projectId');
      }
    });

    it('should throw a 400 error when no projectId', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: ''
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const requestHandler = update.updateProject();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required path parameter: projectId');
      }
    });

    it('updates a project with all valid entries and returns 200 on success', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: '1'
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

      sinon.stub(ProjectService.prototype, 'updateProject').resolves();

      const requestHandler = update.updateProject();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
    });
  });

  describe('viewProjectForEdit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return a project for edit', async () => {
      const dbConnectionObj = getMockDBConnection();
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const project = {
        id: 1,
        project_name: 'test project',
        start_date: '2022-02-02',
        end_date: '2022-02-30',
        objectives: 'my objectives',
        publish_date: '2022-02-02',
        revision_count: 0
      };

      mockReq.params = {
        projectId: '1'
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(ProjectService.prototype, 'getProjectByIdForEdit').resolves(project as any);

      const requestHandler = update.viewProjectForEdit();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).to.have.been.calledWith(200);
      expect(mockRes.json).to.have.been.calledWith(project);
    });

    it('should catch and re-throw an error', async () => {
      const dbConnectionObj = getMockDBConnection();
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: '1'
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(ProjectService.prototype, 'getProjectByIdForEdit').rejects(new Error('a test error'));

      const requestHandler = update.viewProjectForEdit();
      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
