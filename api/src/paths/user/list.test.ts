import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as db from '../../database/db';
import { UserService } from '../../services/user-service';
import * as users from './list';

chai.use(sinonChai);

describe('users', () => {
  describe('getUserList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return rows on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const mockResponse = [
        {
          id: 1,
          user_guid: '123456',
          user_identifier: 'identifier',
          identity_source: 'identitysource',
          record_end_date: '',
          role_ids: [1, 2],
          role_names: ['System Admin', 'Lead Editor']
        }
      ];

      sinon.stub(UserService.prototype, 'listSystemUsers').resolves(mockResponse);

      const requestHandler = users.getUserList();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockResponse);
    });

    it('catches and rethrows error', async () => {
      const mockDBConnection = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const mockError = new Error('mock error');

      sinon.stub(UserService.prototype, 'listSystemUsers').throws(mockError);

      const requestHandler = users.getUserList();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (err) {
        expect(err).to.eql(mockError);
      }
    });
  });
});
