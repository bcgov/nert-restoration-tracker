import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import * as db from '../../../../../database/db';
import { UserService } from '../../../../../services/user-service';
import * as update_project_participant from './update';

chai.use(sinonChai);

describe('Update a project participant.', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(UserService.prototype, 'handleUpdateProjectParticipantRole').throws(new Error('Test error'));

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = update_project_participant.updateProjectParticipantRole();
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (actualError) {
      expect((actualError as Error).message).to.equal('Test error');
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(UserService.prototype, 'handleUpdateProjectParticipantRole').resolves(undefined);

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
