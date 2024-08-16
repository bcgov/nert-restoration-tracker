import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentRepository } from './attachment-repository';

chai.use(sinonChai);

describe('AttachmentRepository', () => {
  describe('getProjectAttachmentsByType', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return rows on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        knex: async () => {
          return mockQueryResponse;
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      const response = await attachmentRepository.getProjectAttachmentsByType(1, 'attachments');

      expect(response).to.deep.equal([{ id: 1 }]);
    });

    it('catch and throw error', async () => {
      const mockDBConnection = getMockDBConnection({
        knex: async () => {
          throw new Error('error');
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      try {
        await attachmentRepository.getProjectAttachmentsByType(1, 'attachments');
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getProjectAttachmentByFileNameAndType', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return a single row on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      const response = await attachmentRepository.getProjectAttachmentByFileNameAndType(1, 'file', 'attachments');

      expect(response).to.deep.equal({ id: 1 });
    });

    it('catch and throw error', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: () => {
          throw new Error('Failed to get project attachment by filename');
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      try {
        await attachmentRepository.getProjectAttachmentByFileNameAndType(1, 'file', 'attachments');
      } catch (error: any) {
        expect(error.message).to.equal('Failed to get project attachment by filename');
      }
    });
  });

  describe('deleteProjectAttachment', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return rows on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      const response = await attachmentRepository.deleteProjectAttachment(1, 1);

      expect(response).to.deep.equal({ id: 1 });
    });

    it('catch and throw error', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      try {
        await attachmentRepository.deleteProjectAttachment(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete attachment');
      }
    });
  });

  describe('insertProjectAttachment', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return rows on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      const response = await attachmentRepository.insertProjectAttachment('name', 1, 1, 'key', 'type');

      expect(response).to.deep.equal({ id: 1 });
    });

    it('catch and throw error', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      try {
        await attachmentRepository.insertProjectAttachment('name', 1, 1, 'key', 'type');
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert attachment');
      }
    });
  });

  describe('updateProjectAttachment', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return rows on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      const response = await attachmentRepository.updateProjectAttachment(1, 'name');

      expect(response).to.deep.equal({ id: 1 });
    });

    it('catch and throw error', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const attachmentRepository = new AttachmentRepository(mockDBConnection);

      try {
        await attachmentRepository.updateProjectAttachment(1, 'name');
      } catch (error: any) {
        expect(error.message).to.equal('Failed to update attachment');
      }
    });
  });
});
