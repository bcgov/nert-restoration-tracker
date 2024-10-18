import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { IGetReport } from '../interfaces/reports.interface';
import { ReportRepository } from './report-repository';

chai.use(sinonChai);

describe('ReportRepository', () => {
  describe('getAppStatsData', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return Project on success', async () => {
      const mockRows = [
        { count: 1 },
        { count: 2 },
        { count: 3 },
        { count: 4 },
        { count: 5 },
        { count: 6 },
        { count: 7 },
        { count: 8 },
        { count: 9 }
      ] as any;

      const mockQueryResponse = [
        { rowCount: 9, rows: mockRows },
        { rowCount: 1, rows: [{ project_id: 1, name: 'project last-created', last_date: 'date' }] },
        { rowCount: 1, rows: [{ project_id: 2, name: 'plan last-created', last_date: 'date' }] },
        { rowCount: 1, rows: [{ project_id: 3, name: 'project last-update', last_date: 'date' }] },
        { rowCount: 1, rows: [{ project_id: 4, name: 'plan last-update', last_date: 'date' }] }
      ] as any as Promise<QueryResult<any>>;

      const mockResponse = {
        project: {
          published_projects: 1,
          draft_projects: 5,
          archived_projects: 3
        },
        plan: {
          published_plans: 2,
          draft_plans: 6,
          archived_plans: 4
        },
        user: {
          admins: 7,
          creators: 8,
          maintainers: 9
        },
        last_created: {
          project: {
            id: 1,
            name: 'project last-created',
            datetime: 'date'
          },
          plan: {
            id: 2,
            name: 'plan last-created',
            datetime: 'date'
          }
        },
        last_updated: {
          project: {
            id: 3,
            name: 'project last-update',
            datetime: 'date'
          },
          plan: {
            id: 4,
            name: 'plan last-update',
            datetime: 'date'
          }
        }
      } as IGetReport;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const reportRepository = new ReportRepository(mockDBConnection);

      const response = await reportRepository.getAppStatsData();

      expect(response).to.eql(mockResponse);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const reportRepository = new ReportRepository(mockDBConnection);

      try {
        await reportRepository.getAppStatsData();
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getAppUserReportData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return AppUserReport on success', async () => {
      const mockRows = [
        {
          user_id: 1,
          user_name: 'user',
          role_names: ['role'],
          prj_count: 1,
          plan_count: 2,
          arch_prj_count: 3,
          arch_plan_count: 4,
          draft_prj_count: 5,
          draft_plan_count: 6
        }
      ] as any;

      const mockQueryResponse = { rowCount: 1, rows: mockRows } as any as Promise<QueryResult<any>>;

      const mockResponse = [
        {
          user_id: 1,
          user_name: 'user',
          role_names: ['role'],
          prj_count: 1,
          plan_count: 2,
          arch_prj_count: 3,
          arch_plan_count: 4,
          draft_prj_count: 5,
          draft_plan_count: 6
        }
      ];

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const reportRepository = new ReportRepository(mockDBConnection);

      const response = await reportRepository.getAppUserReportData();

      expect(response).to.eql(mockResponse);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const reportRepository = new ReportRepository(mockDBConnection);

      try {
        await reportRepository.getAppUserReportData();
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getPIMgmtReportData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return PIMgmtReport on success', async () => {
      const mockRows = [
        {
          project_id: 1,
          project_name: 'project',
          plan_count: 1,
          plan_draft_count: 2,
          plan_archived_count: 3,
          plan_published_count: 4
        }
      ] as any;

      const mockQueryResponse = { rowCount: 1, rows: mockRows } as any as Promise<QueryResult<any>>;

      const mockResponse = [
        {
          project_id: 1,
          project_name: 'project',
          plan_count: 1,
          plan_draft_count: 2,
          plan_archived_count: 3,
          plan_published_count: 4
        }
      ];

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const reportRepository = new ReportRepository(mockDBConnection);

      const response = await reportRepository.getPIMgmtReportData('2021-01-01', '2021-01-01');

      expect(response).to.eql(mockResponse);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const reportRepository = new ReportRepository(mockDBConnection);

      try {
        await reportRepository.getPIMgmtReportData('2021-01-01', '2021-01-01');
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getCustomReportData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return CustomReport on success', async () => {
      const mockRows = [
        {
          project_id: 1,
          project_name: 'project',
          plan_count: 1,
          plan_draft_count: 2,
          plan_archived_count: 3,
          plan_published_count: 4
        }
      ] as any;

      const mockQueryResponse = { rowCount: 1, rows: mockRows } as any as Promise<QueryResult<any>>;

      const mockResponse = [
        {
          project_id: 1,
          project_name: 'project',
          plan_count: 1,
          plan_draft_count: 2,
          plan_archived_count: 3,
          plan_published_count: 4
        }
      ];

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const reportRepository = new ReportRepository(mockDBConnection);

      const response = await reportRepository.getCustomReportData('2021-01-01', '2021-01-01');

      expect(response).to.eql(mockResponse);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const reportRepository = new ReportRepository(mockDBConnection);

      try {
        await reportRepository.getCustomReportData('2021-01-01', '2021-01-01');
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });
});
