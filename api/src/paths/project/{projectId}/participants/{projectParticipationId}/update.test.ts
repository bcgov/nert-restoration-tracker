import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { ProjectService } from '../../../../../services/project-service';
import * as update_project_participant from './update';
chai.use(sinonChai);

describe.skip('Update a project participant.', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    mockReq.params = { projectId: '', projectParticipationId: '2' };

    try {
      const requestHandler = update_project_participant.updateProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no projectParticipationId is provided', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    mockReq.params = { projectId: '1', projectParticipationId: '' };

    try {
      const requestHandler = update_project_participant.updateProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectParticipationId`');
    }
  });

  it('should throw a 400 error when no roleId is provided', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '' };

    try {
      const requestHandler = update_project_participant.updateProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param `roleId`');
    }
  });

  it('should throw a 400 error when connection query fails', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

    sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves([{ system_user_id: 1 } as any]);
    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves(undefined);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = update_project_participant.updateProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to delete project team member');
    }
  });

  it('should throw a 400 error when user is only project lead', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 });

    const getProjectParticipant = sinon.stub(ProjectService.prototype, 'getProjectParticipants');

    getProjectParticipant.onCall(0).resolves([{ system_user_id: 1 } as any]);
    getProjectParticipant.onCall(1).resolves([]);

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ system_user_id: 1 }],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    try {
      const requestHandler = update_project_participant.updateProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot update project user. User is the only Project Lead for the project.'
      );
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves(undefined);
    const getProjectParticipant = sinon.stub(ProjectService.prototype, 'getProjectParticipants');

    getProjectParticipant.onCall(0).resolves([{ system_user_id: 1 } as any]);
    getProjectParticipant.onCall(1).resolves([{ system_user_id: 2 } as any]);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const requestHandler = update_project_participant.updateProjectParticipantRole();

    await requestHandler(mockReq, mockRes, mockNext);
    expect(mockRes.statusValue).to.equal(200);
  });
});
