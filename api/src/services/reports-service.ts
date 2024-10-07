import { IDBConnection } from '../database/db';
import { IGetAppUserReport, IGetCustomReport, IGetPIMgmtReport, IGetReport } from '../interfaces/reports.interface';
import { ReportRepository } from '../repositories/report-repository';
import { DBService } from './service';

export class ReportService extends DBService {
  reportRepository: ReportRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.reportRepository = new ReportRepository(connection);
  }

  /**
   * Get application stats.
   *
   * @return {*}  {Promise<IGetReport>}
   * @memberof ReportService
   */
  async getAppStats(): Promise<IGetReport> {
    const reportStatResponse = await Promise.all([this.reportRepository.getAppStatsData()]);

    return reportStatResponse[0];
  }

  /**
   * Get application user report data.
   *
   * @return {*}  {Promise<IGetAppUserReport>}
   * @memberof ReportService
   */
  async getAppUserReport(): Promise<IGetAppUserReport[]> {
    const reportAppResponse = await Promise.all([this.reportRepository.getAppUserReportData()]);

    return reportAppResponse[0];
  }

  /**
   * Get application PI report data.
   *
   * @return {*}  {Promise<IGetAppUserReport>}
   * @memberof ReportService
   */
  async getPIMgmtReport(startDate: string, endDate: string): Promise<IGetPIMgmtReport[]> {
    const reportPIResponse = await Promise.all([this.reportRepository.getPIMgmtReportData(startDate, endDate)]);

    return reportPIResponse[0];
  }

  /**
   * Get application Custom report data.
   *
   * @return {*}  {Promise<IGetAppUserReport>}
   * @memberof ReportService
   */
  async getCustomReport(startDate: string, endDate: string): Promise<IGetCustomReport[]> {
    const reportPIResponse = await Promise.all([this.reportRepository.getCustomReportData(startDate, endDate)]);

    return reportPIResponse[0];
  }
}
