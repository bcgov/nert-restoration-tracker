import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { UserRepository } from './user-repository';

chai.use(sinonChai);

describe('UserRepository', () => {
  describe('getUserByUserIdentifier', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should throw error when rowCount != 1', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.getUserByUserIdentifier('user', 'source');
      } catch (error: any) {
        expect(error.message).to.equal('Failed to get user by identifier');
      }
    });

    it('should get user by identifier', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email@email.com',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.getUserByUserIdentifier('username', 'idir');

      expect(response).to.equal(mockResponse[0]);
    });
  });

  describe('getUserById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw error when rowCount != 1', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.getUserById(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to get user by id');
      }
    });

    it('should get user by id', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.getUserById(1);

      expect(response).to.equal(mockResponse[0]);
    });
  });

  describe('getUserByGuid', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw error when rowCount != 1', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.getUserByGuid('aaaa');
      } catch (error: any) {
        expect(error.message).to.equal('Failed to get user by guid');
      }
    });

    it('should get user by guid', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.getUserByGuid('aaaa');

      expect(response).to.equal(mockResponse[0]);
    });
  });

  describe('getUserList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should get user list', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.getUserList();

      expect(response).to.equal(mockResponse);
    });
  });

  describe('addSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw error when rowCount != 1', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.addSystemUser('username', 'aaaa', 'idir');
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert new user');
      }
    });

    it('should add system user', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.addSystemUser('username', 'aaaa', 'idir');

      expect(response).to.equal(mockResponse[0]);
    });
  });

  describe('deactivateSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw error when rowCount != 1', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.deactivateSystemUser(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to deactivate system user');
      }
    });

    it('should deactivate system user', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.deactivateSystemUser(1);

      expect(response).to.equal(undefined);
    });
  });

  describe('activateSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw error when rowCount != 1', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.activateSystemUser(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to activate system user');
      }
    });

    it('should activate system user', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.activateSystemUser(1);

      expect(response).to.equal(undefined);
    });
  });

  describe('postSystemRoles', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw error when rowCount != 1', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.postSystemRoles(1, [1]);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert user system roles');
      }
    });

    it('should post system roles', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.postSystemRoles(1, [1]);

      expect(response).to.equal(undefined);
    });
  });

  describe('deleteUserSystemRoles', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete user system roles', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.deleteUserSystemRoles(1);

      expect(response).to.equal(undefined);
    });
  });

  describe('deleteAllProjectRoles', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete all project roles', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin'],
          email: 'email',
          display_name: 'test name',
          organization: null
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.deleteAllProjectRoles(1);

      expect(response).to.equal(undefined);
    });
  });
});
