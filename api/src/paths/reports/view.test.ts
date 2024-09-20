import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as db from '../../database/db';
import { ReportService } from '../../services/reports-service';
import { viewReportStats } from './view';

chai.use(sinonChai);

describe('viewReportStats', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return reports dashboard view', async () => {
    const dbConnectionObj = getMockDBConnection();
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const stats = {
      project: { published_projects: 4, draft_projects: 3, archived_projects: 2 },
      plan: { published_plans: 0, draft_plans: 0, archived_plans: 1 },
      user: { admins: 6, creators: 3, maintainers: 2 },
      last_created: {
        project: {
          id: 15,
          name: 'Project-Maintainer-Z9',
          datetime: '2024-09-16 11:41:51.861565-07'
        },
        plan: {
          id: 14,
          name: 'Plan-Maintainer-R9',
          datetime: '2024-09-16 11:40:17.639755-07'
        }
      },
      last_updated: {
        project: {
          id: 8,
          name: 'Project-Admin-Z9',
          datetime: '2024-09-16 11:43:44.476722-07'
        },
        plan: {
          id: 14,
          name: 'Plan-Maintainer-R9',
          datetime: '2024-09-16 11:44:21.282645-07'
        }
      }
    };

    mockReq.params = {};

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(ReportService.prototype, 'getAppStats').resolves(stats as any);

    const requestHandler = viewReportStats();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith(stats);
  });

  it('should catch and re-throw an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      keycloak_token: 'token'
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(ReportService.prototype, 'getAppStats').rejects(new Error('a test error'));

    const requestHandler = viewReportStats();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (err: any) {
      expect(err.message).to.equal('a test error');
    }
  });
});
