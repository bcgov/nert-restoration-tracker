import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { PlanRepository } from './plan-repository';

chai.use(sinonChai);

describe('PlanRepository', () => {
  describe('getPlanById', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return Plan by Id', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        query: async () => {
          return mockQueryResponse;
        }
      });

      const planRepository = new PlanRepository(mockDBConnection);

      const response = await planRepository.getPlanById(1);

      expect(response).to.eql({ project_id: 1 });
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        query: async () => {
          throw new Error('error');
        }
      });

      const planRepository = new PlanRepository(mockDBConnection);

      try {
        await planRepository.getPlanById(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertPlan', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should insert plan and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const planRepository = new PlanRepository(mockDBConnection);

      const response = await planRepository.insertPlan({
        name: 'name',
        brief_desc: 'brief_desc',
        is_project: true,
        state_code: 1,
        start_date: 'string-date',
        end_date: 'string-date',
        is_healing_land: true,
        is_healing_people: true,
        is_land_initiative: true,
        is_cultural_initiative: true
      });

      expect(response).to.deep.equal({ project_id: 1 });
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const planRepository = new PlanRepository(mockDBConnection);

      try {
        await planRepository.insertPlan({
          name: 'name',
          brief_desc: 'brief_desc',
          is_project: true,
          state_code: 1,
          start_date: 'string-date',
          end_date: 'string-date',
          is_healing_land: true,
          is_healing_people: true,
          is_land_initiative: true,
          is_cultural_initiative: true
        });
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('updatePlan', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should update plan and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const planRepository = new PlanRepository(mockDBConnection);

      const response = await planRepository.updatePlan(
        {
          name: 'name',
          brief_desc: 'brief_desc',
          is_project: true,
          state_code: 1,
          start_date: 'string-date',
          end_date: 'string-date',
          is_healing_land: true,
          is_healing_people: true,
          is_land_initiative: true,
          is_cultural_initiative: true
        },
        1
      );

      expect(response).to.deep.equal({ project_id: 1 });
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const planRepository = new PlanRepository(mockDBConnection);

      try {
        await planRepository.updatePlan(
          {
            name: 'name',
            brief_desc: 'brief_desc',
            is_project: true,
            state_code: 1,
            start_date: 'string-date',
            end_date: 'string-date',
            is_healing_land: true,
            is_healing_people: true,
            is_land_initiative: true,
            is_cultural_initiative: true
          },
          1
        );
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });
});
