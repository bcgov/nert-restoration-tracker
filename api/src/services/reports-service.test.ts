import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { ReportRepository } from '../repositories/report-repository';
import { ReportService } from './reports-service';

chai.use(sinonChai);

describe('ReportService', () => {
  describe('getAppStats', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return appStats', async () => {
      const mockDBConnection = getMockDBConnection();
      const mockResponse = { id: 1, name: 'test' } as any;

      sinon.stub(ReportRepository.prototype, 'getAppStatsData').resolves(mockResponse);

      const reportService = await new ReportService(mockDBConnection);

      const result = await reportService.getAppStats();

      chai.expect(result).to.equal(mockResponse);
    });
  });

  describe('getAppUserReport', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return appUserReport', async () => {
      const mockDBConnection = getMockDBConnection();
      const mockResponse = [{ id: 1, name: 'test' }] as any;

      sinon.stub(ReportRepository.prototype, 'getAppUserReportData').resolves(mockResponse);

      const reportService = await new ReportService(mockDBConnection);

      const result = await reportService.getAppUserReport();

      chai.expect(result).to.equal(mockResponse);
    });
  });

  describe('getPIMgmtReport', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return piMgmtReport', async () => {
      const mockDBConnection = getMockDBConnection();
      const mockResponse = [{ id: 1, name: 'test' }] as any;

      sinon.stub(ReportRepository.prototype, 'getPIMgmtReportData').resolves(mockResponse);

      const reportService = await new ReportService(mockDBConnection);

      const result = await reportService.getPIMgmtReport('2021-01-01', '2021-01-31');

      chai.expect(result).to.equal(mockResponse);
    });
  });

  describe('getCustomReport', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return customReport', async () => {
      const mockDBConnection = getMockDBConnection();
      const mockResponse = [{ id: 1, name: 'test' }] as any;

      sinon.stub(ReportRepository.prototype, 'getCustomReportData').resolves(mockResponse);

      const reportService = await new ReportService(mockDBConnection);

      const result = await reportService.getCustomReport('2021-01-01', '2021-01-31');

      chai.expect(result).to.equal(mockResponse);
    });
  });
});
