import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CodeRepository } from './code-repository';

chai.use(sinonChai);

describe('CodeRepository', () => {
  describe('getFirstNations', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getFirstNations();

      expect(response).to.deep.equal([]);
    });
  });

  describe('getFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getFundingSource();

      expect(response).to.deep.equal([]);
    });
  });

  describe('getInvestmentActionCategory', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getInvestmentActionCategory();

      expect(response).to.deep.equal([]);
    });
  });

  describe('getIUCNConservationActionLevel1Classification', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getIUCNConservationActionLevel1Classification();

      expect(response).to.deep.equal([]);
    });
  });

  describe('getIUCNConservationActionLevel2Subclassification', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getIUCNConservationActionLevel2Subclassification();

      expect(response).to.deep.equal([]);
    });
  });

  describe('getIUCNConservationActionLevel3Subclassification', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getIUCNConservationActionLevel3Subclassification();

      expect(response).to.deep.equal([]);
    });
  });

  describe('getSystemRoles', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getSystemRoles();

      expect(response).to.deep.equal([]);
    });
  });

  describe('getProjectRoles', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getProjectRoles();

      expect(response).to.deep.equal([]);
    });
  });

  describe('getAdministrativeActivityStatusType', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new CodeRepository(mockDBConnection);

      const response = await codeRepository.getAdministrativeActivityStatusType();

      expect(response).to.deep.equal([]);
    });
  });
});
