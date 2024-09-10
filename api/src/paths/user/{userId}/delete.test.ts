import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { HTTPError, HTTPErrorType } from '../../../errors/custom-error';
import { ProjectService } from '../../../services/project-service';
import { UserService } from '../../../services/user-service';
import * as delete_endpoint from './delete';

chai.use(sinonChai);

describe('removeSystemUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when missing required path param: userId', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: userId');
    }
  });

  it('should throw a 400 error if the user is the only Lead Editor role on one or more projects', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '33' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj
    });

    sinon
      .stub(ProjectService.prototype, 'checkIfUserIsOnlyProjectLeadOnAnyProject')
      .throws(
        new HTTPError(
          HTTPErrorType.BAD_REQUEST,
          400,
          'Cannot remove user. User is the only Lead Editor for one or more projects.'
        )
      );

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot remove user. User is the only Lead Editor for one or more projects.'
      );
    }
  });

  it('should return 200 on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(ProjectService.prototype, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'handleDeleteSystemUser').resolves();

    const requestHandler = delete_endpoint.removeSystemUser();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });
});
