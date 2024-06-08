import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../constants/administrative-activity';
import { AdministrativeActivityRepository } from './administrative-activity-repository';

chai.use(sinonChai);

describe('AdministrativeActivityRepository', () => {
  describe('getAdministrativeActivities', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return empty array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const administrativeActivityRepository = new AdministrativeActivityRepository(mockDBConnection);

      const response = await administrativeActivityRepository.getAdministrativeActivities(
        ['Name', 'Name2'],
        ['type', 'type2']
      );

      expect(response).to.deep.equal([]);
    });
  });

  describe('createPendingAccessRequest', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return a new pending access request', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const administrativeActivityRepository = new AdministrativeActivityRepository(mockDBConnection);

      const response = await administrativeActivityRepository.createPendingAccessRequest(1, 'string');

      expect(response).to.deep.equal({ id: 1 });
    });

    it('should throw an error if the query fails', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const administrativeActivityRepository = new AdministrativeActivityRepository(mockDBConnection);

      try {
        await administrativeActivityRepository.getAdministrativeActivities();
      } catch (error: any) {
        expect(error.message).to.equal('Failed to create administrative activity record');
      }
    });
  });

  describe('getAdministrativeActivityStanding', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return empty array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const administrativeActivityRepository = new AdministrativeActivityRepository(mockDBConnection);

      const response = await administrativeActivityRepository.getAdministrativeActivityStanding('guid');

      expect(response).to.deep.equal([]);
    });
  });

  describe('putAdministrativeActivity', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return a new pending access request', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const administrativeActivityRepository = new AdministrativeActivityRepository(mockDBConnection);

      const response = await administrativeActivityRepository.putAdministrativeActivity(
        1,
        ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.PENDING
      );

      expect(response).to.eql(undefined);
    });

    it('should throw an error if the query fails', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const administrativeActivityRepository = new AdministrativeActivityRepository(mockDBConnection);

      try {
        await administrativeActivityRepository.getAdministrativeActivities();
      } catch (error: any) {
        expect(error.name).to.equal('Error executing SQL query');
        expect(error.message).to.equal('Failed to update administrative activity record');
        expect(error.errors).to.deep.equal(['AdministrativeActivityRepository->putAdministrativeActivity']);
      }
    });
  });
});
