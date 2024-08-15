import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as db from '../../database/db';
import { AdministrativeActivityService } from '../../services/administrative-activity-service';
import * as administrative_activities from './list';

chai.use(sinonChai);

describe('getAdministrativeActivities', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and rethrows errors', async () => {
    const mockDBConnection = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      sinon
        .stub(AdministrativeActivityService.prototype, 'getAdministrativeActivities')
        .rejects(new Error('An error occurred'));

      const requestHandler = administrative_activities.getAdministrativeActivities();

      await requestHandler(mockReq, mockRes, mockNext);

      expect.fail();
    } catch (actualError: any) {
      expect(actualError.message).to.equal('An error occurred');
    }
  });

  it('should return the rows on success (empty)', async () => {
    sinon.stub(AdministrativeActivityService.prototype, 'getAdministrativeActivities').resolves([]);

    const mockDBConnection = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      type: ['type'],
      status: ['status']
    };

    const requestHandler = administrative_activities.getAdministrativeActivities();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql([]);
  });

  it('should return the rows on success (not empty)', async () => {
    const data = {
      id: 1,
      type: 'type',
      type_name: 'type name',
      status: 'status',
      status_name: 'status name',
      description: 'description',
      data: null,
      notes: 'notes',
      create_date: '2020/04/04'
    };

    const mockSql = sinon.stub().resolves({
      rows: [data],
      rowCount: 1
    });

    const mockDBConnection = getMockDBConnection({ sql: mockSql });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      type: ['type'],
      status: ['status']
    };

    const requestHandler = administrative_activities.getAdministrativeActivities();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql([data]);
  });
});
