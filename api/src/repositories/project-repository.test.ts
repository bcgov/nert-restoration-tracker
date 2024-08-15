import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { PutProjectData } from '../models/project-update';
import {
  GetAuthorizationData,
  GetContactData,
  GetFundingData,
  GetPartnershipsData,
  GetProjectData
} from '../models/project-view';
import { ProjectRepository } from './project-repository';

chai.use(sinonChai);

describe('ProjectRepository', () => {
  describe('getProjectData', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return Project on success', async () => {
      const mockObject = { project_id: 1, name: 'test' } as any;

      const mockQueryResponse = { rowCount: 1, rows: [mockObject] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getProjectData(1);

      expect(response).to.eql(new GetProjectData(mockObject));
    });

    it('throws error if no project is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getProjectData(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to get project');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getProjectData(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getProjectSpecies', () => {
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

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getProjectSpecies(1);

      expect(response).to.deep.equal([]);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getProjectSpecies(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getContactData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return array in rows with isPublic = true', async () => {
      const mockObject = {
        first_name: 'first_name',
        last_name: 'last_name',
        email_address: 'email_address',
        organization: 'organization',
        phone_number: 'phone_number',
        is_public: 'Y',
        is_primary: 'Y',
        is_first_nation: true
      };
      const mockQueryResponse = { rowCount: 1, rows: [mockObject] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getContactData(1, true);

      expect(response).to.deep.equal(new GetContactData([mockObject, { organization: 'First Nation' }]));
    });

    it('should return array in rows with isPublic = false', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getContactData(1, false);

      expect(response).to.deep.equal(new GetContactData([]));
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getContactData(1, true);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getAuthorizationData', () => {
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

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getAuthorizationData(1);

      expect(response).to.deep.equal(new GetAuthorizationData([]));
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getAuthorizationData(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getPartnershipsData', () => {
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

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getPartnershipsData(1);

      expect(response).to.deep.equal(new GetPartnershipsData([]));
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getPartnershipsData(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getObjectivesData', () => {
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

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getObjectivesData(1);

      expect(response).to.deep.equal([]);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getObjectivesData(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getConservationAreasData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [{ conservation_area: 'string' }] } as any as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getConservationAreasData(1);

      expect(response).to.deep.equal([{ conservationArea: 'string' }]);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getConservationAreasData(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getFundingData', () => {
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

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getFundingData(1, false);

      expect(response).to.deep.equal(new GetFundingData([]));
    });

    it('should return array in rows when public is true', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getFundingData(1, true);

      expect(response).to.deep.equal(new GetFundingData([]));
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getFundingData(1, false);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getGeometryData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getGeometryData(1);

      expect(response).to.deep.equal([{ id: 1 }]);
    });

    it('throw error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getGeometryData(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to get Geometry');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getGeometryData(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getRegionData', () => {
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

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getRegionData(1);

      expect(response).to.deep.equal([]);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getRegionData(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getSpecies', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return array in rows', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ itis_tsn: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getSpecies(1);

      expect(response).to.deep.equal([{ itis_tsn: 1 }]);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getSpecies(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('getSpatialSearch', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return array in rows when user isAdmin', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getSpatialSearch(true, 1);

      expect(response).to.deep.equal([{ id: 1 }]);
    });

    it('should return array in rows when user is not admin', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.getSpatialSearch(false, 1);

      expect(response).to.deep.equal([{ id: 1 }]);
    });

    it('throw error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getSpatialSearch(true, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to get spatial search results');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.getSpatialSearch(true, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert project and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertProject({
        name: 'name',
        brief_desc: 'brief_desc',
        is_project: true,
        state_code: 1,
        start_date: 'string-date',
        end_date: 'string-date',
        is_healing_land: true,
        is_healing_people: true,
        is_land_initiative: true,
        is_cultural_initiative: true,
        actual_end_date: 'string-date',
        actual_start_date: 'string-date',
        people_involved: 1,
        is_project_part_public_plan: true
      });

      expect(response).to.eql({ project_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProject({
          name: 'name',
          brief_desc: 'brief_desc',
          is_project: true,
          state_code: 1,
          start_date: 'string-date',
          end_date: 'string-date',
          is_healing_land: true,
          is_healing_people: true,
          is_land_initiative: true,
          is_cultural_initiative: true,
          actual_end_date: 'string-date',
          actual_start_date: 'string-date',
          people_involved: 1,
          is_project_part_public_plan: true
        });
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProject({
          name: 'name',
          brief_desc: 'brief_desc',
          is_project: true,
          state_code: 1,
          start_date: 'string-date',
          end_date: 'string-date',
          is_healing_land: true,
          is_healing_people: true,
          is_land_initiative: true,
          is_cultural_initiative: true,
          actual_end_date: 'string-date',
          actual_start_date: 'string-date',
          people_involved: 1,
          is_project_part_public_plan: true
        });
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertProjectContact', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert project contact and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_contact_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertProjectContact({ id: 1 } as any, 1);

      expect(response).to.eql({ project_contact_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProjectContact({ id: 1 } as any, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project Contact');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProjectContact({ id: 1 } as any, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('updateProjectFocus', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert project focus and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.updateProjectFocus({ focuses: [1, 2, 3, 4], people_involved: 1 }, 1);

      expect(response).to.eql({ project_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.updateProjectFocus({ id: 1 } as any, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project focus');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.updateProjectFocus({ id: 1 } as any, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertProjectRestPlan', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert project rest plan and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_restoration_plan_id: 1 }] } as any as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertProjectRestPlan(
        { plan: 'plan', is_project_part_public_plan: true } as any,
        1
      );

      expect(response).to.eql({ project_restoration_plan_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProjectRestPlan({ plan: 'plan', is_project_part_public_plan: true } as any, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project rest plan');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProjectRestPlan({ plan: 'plan', is_project_part_public_plan: true } as any, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert funding source and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ funding_source_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertFundingSource(
        {
          organization_name: 'agency name',
          description: 'ABC123',
          funding_project_id: 'investment action',
          funding_amount: 333,
          start_date: '2021-01-10',
          end_date: '2021-01-20',
          is_public: true
        },
        1
      );

      expect(response).to.eql({ funding_source_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertFundingSource(
          {
            organization_name: 'agency name',
            description: 'ABC123',
            funding_project_id: 'investment action',
            funding_amount: 333,
            start_date: '2021-01-10',
            end_date: '2021-01-20',
            is_public: true
          },
          1
        );
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project funding source');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertFundingSource(
          {
            organization_name: 'agency name',
            description: 'ABC123',
            funding_project_id: 'investment action',
            funding_amount: 333,
            start_date: '2021-01-10',
            end_date: '2021-01-20',
            is_public: true
          },
          1
        );
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertPartnership', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert partnership and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ partnership_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertPartnership('string', 1);

      expect(response).to.eql({ partnership_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertPartnership('string', 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project partnership');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertPartnership('string', 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertObjective', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert objective and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ objective_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertObjective('string', 1);

      expect(response).to.eql({ objective_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertObjective('string', 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project objective');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertObjective('string', 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertConservationArea', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert conservation area and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ conservation_area_id: 1 }] } as any as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertConservationArea('string', 1);

      expect(response).to.eql({ conservation_area_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertConservationArea('string', 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project conservation area');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertConservationArea('string', 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertAuthorization', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert permit and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ permit_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertAuthorization('string', 'string', 'string', 1);

      expect(response).to.eql({ permit_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertAuthorization('string', 'string', 'string', 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert permit ("authorization")');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertAuthorization('string', 'string', 'string', 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertSpecies', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert species and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ species_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertSpecies(1, 1);

      expect(response).to.eql({ species_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertSpecies(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert species');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertSpecies(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertProjectRegion', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert project region and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ nrm_region_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertProjectRegion(1, 1);

      expect(response).to.eql({ nrm_region_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProjectRegion(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project region');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProjectRegion(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('insertProjectLocation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert project location and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_location_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.insertProjectLocation(
        {
          geometry: [{ coordinates: [1, 2] } as any],
          is_within_overlapping: 'string',
          region: 1,
          number_sites: 1,
          size_ha: 1,
          conservationAreas: []
        },
        1
      );

      expect(response).to.eql({ project_location_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProjectLocation(
          {
            geometry: [],
            is_within_overlapping: 'string',
            region: 1,
            number_sites: 1,
            size_ha: 1,
            conservationAreas: []
          },
          1
        );
      } catch (error: any) {
        expect(error.message).to.equal('Failed to insert project location');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.insertProjectLocation(
          {
            geometry: [],
            is_within_overlapping: 'string',
            region: 1,
            number_sites: 1,
            size_ha: 1,
            conservationAreas: []
          },
          1
        );
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('updateProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should update project and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.updateProject(1, {
        name: 'name',
        start_date: 'string-date',
        end_date: 'string-date'
      } as PutProjectData);

      expect(response).to.eql({ project_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.updateProject(1, {
          name: 'name',
          start_date: 'string-date',
          end_date: 'string-date'
        } as PutProjectData);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to update project');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.updateProject(1, {
          name: 'name',
          start_date: 'string-date',
          end_date: 'string-date'
        } as PutProjectData);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('updateProjectLocation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should update project location and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_spatial_component_id: 1 }] } as any as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.updateProjectLocation(1, {
        geometry: [],
        is_within_overlapping: 'string',
        region: 1,
        number_sites: 1,
        size_ha: 1
      });

      expect(response).to.eql({ project_spatial_component_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.updateProjectLocation(1, {
          geometry: [],
          is_within_overlapping: 'string',
          region: 1,
          number_sites: 1,
          size_ha: 1
        });
      } catch (error: any) {
        expect(error.message).to.equal('Failed to update Location');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.updateProjectLocation(1, {
          geometry: [],
          is_within_overlapping: 'string',
          region: 1,
          number_sites: 1,
          size_ha: 1
        });
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('updateProjectRegion', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should update project region and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ nrm_region_id: 1 }] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.updateProjectRegion(1, 1);

      expect(response).to.eql({ nrm_region_id: 1 });
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.updateProjectRegion(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.deleteProject(1);

      expect(response).to.eql(true);
    });

    it('catches errors and throws', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProject(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project');
      }
    });
  });

  describe('deleteProjectContact', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project contact and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.deleteProjectContact(1);

      expect(response).to.eql(undefined);
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProjectContact(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project Contact');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProjectContact(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectAuthorization', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project permit and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.deleteProjectAuthorization(1);

      expect(response).to.eql(undefined);
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProjectAuthorization(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project Permit');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProjectAuthorization(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectPartnership', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project partnership and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.deleteProjectPartnership(1);

      expect(response).to.eql(undefined);
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProjectPartnership(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project Partnership');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProjectPartnership(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectObjectives', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project objectives and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      const response = await projectRepository.deleteProjectObjectives(1);

      expect(response).to.eql(undefined);
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProjectObjectives(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project Objectives');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);

      try {
        await projectRepository.deleteProjectObjectives(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project funding source and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      const response = await projectRepository.deleteProjectFundingSource(1);
      expect(response).to.eql(undefined);
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectFundingSource(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project Funding Source');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectFundingSource(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteFundingSourceById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete funding source and return id on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [{ project_funding_source_id: 1 }] } as any as Promise<
        QueryResult<any>
      >;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      const response = await projectRepository.deleteFundingSourceById(1, 1);
      expect(response).to.eql({ project_funding_source_id: 1 });
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteFundingSourceById(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Funding Source');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteFundingSourceById(1, 1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectLocation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project location and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      const response = await projectRepository.deleteProjectLocation(1);
      expect(response).to.eql(undefined);
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectLocation(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project Location');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectLocation(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectRegion', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project region and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      const response = await projectRepository.deleteProjectRegion(1);
      expect(response).to.eql(undefined);
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectRegion(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project Region');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectRegion(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectSpecies', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project species and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      const response = await projectRepository.deleteProjectSpecies(1);
      expect(response).to.eql(undefined);
    });

    it('throws error if no data is found', async () => {
      const mockQueryResponse = null as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectSpecies(1);
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete Project Species');
      }
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectSpecies(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });

  describe('deleteProjectConservationArea', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project conservation area and return true on success', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [true] } as any as Promise<QueryResult<any>>;
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      const response = await projectRepository.deleteProjectConservationArea(1);
      expect(response).to.eql(undefined);
    });

    it('catches errors and throws', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          throw new Error('error');
        }
      });
      const projectRepository = new ProjectRepository(mockDBConnection);
      try {
        await projectRepository.deleteProjectConservationArea(1);
      } catch (error: any) {
        expect(error.message).to.equal('error');
      }
    });
  });
});
