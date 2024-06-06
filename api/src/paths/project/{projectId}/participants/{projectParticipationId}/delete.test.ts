import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { ProjectService } from '../../../../../services/project-service';
import * as delete_project_participant from './delete';
chai.use(sinonChai);

describe.skip('Delete a project participant.', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    mockReq.params = { projectId: '', projectParticipationId: '2' };

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no projectParticipationId is provided', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    mockReq.params = { projectId: '1', projectParticipationId: '' };

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectParticipationId`');
    }
  });

  it('should throw a 400 error when user is only project lead', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 });

    const getProjectParticipant = sinon.stub(ProjectService.prototype, 'getProjectParticipants');

    getProjectParticipant.onCall(0).resolves([{ system_user_id: 1 } as any]);
    getProjectParticipant.onCall(1).resolves([]);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(
        'Cannot delete project user. User is the only Project Lead for the project.'
      );
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves(undefined);
    const getProjectParticipant = sinon.stub(ProjectService.prototype, 'getProjectParticipants');

    getProjectParticipant.onCall(0).resolves([{ id: 1 } as any]);
    getProjectParticipant.onCall(1).resolves([{ id: 2 } as any]);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const requestHandler = delete_project_participant.deleteProjectParticipant();

    await requestHandler(mockReq, mockRes, mockNext);
    expect(mockRes.statusValue).to.equal(200);
  });
});
