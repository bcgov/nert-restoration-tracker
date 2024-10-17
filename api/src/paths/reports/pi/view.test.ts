import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import { ReportService } from '../../../services/reports-service';
import * as view from './view';

describe('viewPiReportApp', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return Pi Report App Data', async () => {
    const dbConnectionObj = getMockDBConnection();

    const requestHandler = view.viewPiReportApp();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = { startDate: '2021-01-01', endDate: '2021-01-31' };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(ReportService.prototype, 'getPIMgmtReport').resolves([]);

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.eql(200);
  });

  it('should catch and rethrow error', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = { startDate: '2021-01-01', endDate: '2021-01-31' };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(ReportService.prototype, 'getPIMgmtReport').throws(new Error('An error occurred'));

    try {
      const requestHandler = view.viewPiReportApp();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('An error occurred');
    }
  });
});
