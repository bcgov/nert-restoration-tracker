import { IDBConnection } from '../database/db';
import { IGetReport } from '../interfaces/reports.interface';
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
}
