import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { DraftRepository } from './draft-repository';

chai.use(sinonChai);

describe('DraftRepository', () => {
  describe('getDraft', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return draft response', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ id: 1, is_project: true, name: 'string', data: {} }]
      } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      const response = await codeRepository.getDraft(1);

      expect(response).to.deep.equal({ id: 1, is_project: true, name: 'string', data: {} });
    });

    it('catches and throws errors', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('mock error');
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      try {
        await codeRepository.getDraft(1);
      } catch (error: any) {
        expect(error.message).to.equal('mock error');
      }
    });
  });

  describe('getDraftList', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return draft list', async () => {
      const mockQueryResponse = {
        rowCount: 2,
        rows: [
          { id: 1, is_project: true, name: 'string' },
          { id: 2, is_project: false, name: 'string' }
        ]
      } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      const response = await codeRepository.getDraftList(1);

      expect(response).to.deep.equal([
        { id: 1, is_project: true, name: 'string' },
        { id: 2, is_project: false, name: 'string' }
      ]);
    });

    it('catches and throws errors', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('mock error');
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      try {
        await codeRepository.getDraftList(1);
      } catch (error: any) {
        expect(error.message).to.equal('mock error');
      }
    });
  });

  describe('createDraft', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return draft response', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ id: 1 }]
      } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      const response = await codeRepository.createDraft(1, true, 'string', {});

      expect(response).to.deep.equal({ id: 1 });
    });

    it('catches and throws errors', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('mock error');
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      try {
        await codeRepository.createDraft(1, true, 'string', {});
      } catch (error: any) {
        expect(error.message).to.equal('mock error');
      }
    });
  });

  describe('updateDraft', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return draft response', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ id: 1 }]
      } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      const response = await codeRepository.updateDraft(1, 'string', {});

      expect(response).to.deep.equal({ id: 1 });
    });

    it('catches and throws errors', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('mock error');
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      try {
        await codeRepository.updateDraft(1, 'string', {});
      } catch (error: any) {
        expect(error.message).to.equal('mock error');
      }
    });
  });

  describe('deleteDraft', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return draft response', async () => {
      const mockQueryResponse = {
        rowCount: 1
      } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      const response = await codeRepository.deleteDraft(1);

      expect(response).to.equal(1);
    });

    it('catches and throws errors', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('mock error');
        }
      });

      const codeRepository = new DraftRepository(mockDBConnection);

      try {
        await codeRepository.deleteDraft(1);
      } catch (error: any) {
        expect(error.message).to.equal('mock error');
      }
    });
  });
});
