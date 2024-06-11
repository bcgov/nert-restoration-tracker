import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectParticipationRepository } from './project-participation-repository';

chai.use(sinonChai);

describe('ProjectParticipationRepository', () => {
  describe('ensureProjectParticipation', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return true if user exists', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ system_user_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      const response = await projectParticipationRepository.ensureProjectParticipation(1, 1);

      expect(response).to.eql(true);
    });

    it('should return false if user does not exist', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      const response = await projectParticipationRepository.ensureProjectParticipation(1, 1);

      expect(response).to.eql(false);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.ensureProjectParticipation(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getParticipantsFromAllSystemUsersProjects', () => {
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

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      const response = await projectParticipationRepository.getParticipantsFromAllSystemUsersProjects(1);

      expect(response).to.deep.equal([]);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.getParticipantsFromAllSystemUsersProjects(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getAllUserProjects', () => {
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

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      const response = await projectParticipationRepository.getAllUserProjects(1);

      expect(response).to.deep.equal([]);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.getAllUserProjects(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getAllProjectParticipants', () => {
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

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      const response = await projectParticipationRepository.getAllProjectParticipants(1);

      expect(response).to.deep.equal([]);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.getAllProjectParticipants(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should insert project participant', async () => {
      const mockQueryResponse = { rowCount: 1 } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      await projectParticipationRepository.insertProjectParticipant(1, 1, 1);
    });

    it('should throw error if rowCount is not 1', async () => {
      const mockQueryResponse = { rowCount: 0 } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.insertProjectParticipant(1, 1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project participant');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.insertProjectParticipant(1, 1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertProjectParticipantByRoleName', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should insert project participant by role name', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      const response = await projectParticipationRepository.insertProjectParticipantByRoleName(1, 1, 'role');
      expect(response).to.deep.equal({ id: 1 });
    });

    it('should throw error if rowCount is not 1', async () => {
      const mockQueryResponse = { rowCount: 0 } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.insertProjectParticipantByRoleName(1, 1, 'role');
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project participant');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.insertProjectParticipantByRoleName(1, 1, 'role');
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectParticipationRecord', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should delete project participation record', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{}] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      await projectParticipationRepository.deleteProjectParticipationRecord(1);
    });

    it('should throw error if rowCount is not 1', async () => {
      const mockQueryResponse = { rowCount: 0 } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.deleteProjectParticipationRecord(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete project team member');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectParticipationRepository = new ProjectParticipationRepository(mockDBConnection);

      try {
        await projectParticipationRepository.deleteProjectParticipationRecord(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });
});
