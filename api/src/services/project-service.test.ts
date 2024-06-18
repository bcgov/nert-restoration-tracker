import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { HTTPError } from '../errors/custom-error';
import * as projectCreateModels from '../models/project-create';
import * as projectUpdateModels from '../models/project-update';
import * as projectViewModels from '../models/project-view';
import { IUpdateProject } from '../paths/project/{projectId}/update';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { ProjectService } from './project-service';

chai.use(sinonChai);

const entitiesInitValue = {
  project: null,
  contact: null,
  authorization: null,
  partnership: null,
  objective: null,
  iucn: null,
  funding: null,
  location: null,
  species: null
};

describe.skip('ProjectService', () => {
  describe('ensureProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const ensureProjectParticipationStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'ensureProjectParticipation')
        .resolves(false);

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      await projectService.ensureProjectParticipant(systemUserId, projectId, projectParticipantRoleId);

      expect(ensureProjectParticipationStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).not.to.have.been.called;
    });

    it('adds a new project participant if one did not already exist', async () => {
      const mockDBConnection = getMockDBConnection();

      const ensureProjectParticipationStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'ensureProjectParticipation')
        .resolves(true);

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(systemUserId, projectId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(ensureProjectParticipationStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).to.have.been.calledOnce;
    });
  });

  describe('getProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns the first row on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = { rows: [mockRowObj] } as unknown as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });

      sinon.stub(ProjectParticipationRepository.prototype, 'getAllProjectParticipants').resolves([]);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.equal(mockRowObj);
    });
  });

  describe('getProjectParticipants', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns empty array if there are no rows', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectParticipationRepository.prototype, 'getAllProjectParticipants').resolves([]);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.eql([]);
    });

    it('returns rows on success', async () => {
      const mockRowObj = [{ id: 123 }];
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectParticipationRepository.prototype, 'getAllProjectParticipants').resolves(mockRowObj as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.equal(mockRowObj);
    });
  });

  describe('addProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should not throw an error on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const insertProjectParticipantStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'insertProjectParticipant')
        .resolves();

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      await projectService.addProjectParticipant(systemUserId, projectId, projectParticipantRoleId);

      expect(insertProjectParticipantStub).to.have.been.calledOnce;
    });
  });

  describe('getProjectData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getProjectData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectData(projectId);

      expect(result).to.eql({ id: 1 });
    });
  });

  describe('getIUCNClassificationData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getIUCNClassificationData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getIUCNClassificationData(projectId);

      expect(result).to.eql({ id: 1 });
    });
  });

  describe('getContactData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success when isPublic is false', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getContactData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getContactData(projectId, false);

      expect(result).to.eql({ id: 1 });
    });

    it('returns row on success when isPublic is true', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getContactData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getContactData(projectId, true);

      expect(result).to.eql({ id: 1 });
    });
  });

  describe('getPermitData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success when isPublic is false', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getPermitData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getPermitData(projectId, false);

      expect(result).to.eql(undefined);
    });

    it('returns empty permit data when isPublic is true', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getPermitData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getPermitData(projectId, true);

      expect(result).to.eql({ id: 1 });
    });
  });

  describe('getPartnershipsData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getPartnershipsData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getPartnershipsData(projectId);

      expect(result).to.eql({ id: 1 });
    });
  });

  describe('getObjectivesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockDBConnection = getMockDBConnection();

      sinon
        .stub(ProjectRepository.prototype, 'getObjectivesData')
        .resolves(new projectViewModels.GetObjectivesData(mockRowObj));

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getObjectivesData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetObjectivesData(mockRowObj));
    });
  });

  describe('getFundingData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockDBConnection = getMockDBConnection();

      sinon
        .stub(ProjectRepository.prototype, 'getFundingData')
        .resolves(new projectViewModels.GetFundingData(mockRowObj));

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getFundingData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetFundingData(mockRowObj));
    });
  });

  describe('getLocationData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getGeometryData').resolves();
      sinon.stub(ProjectRepository.prototype, 'getRegionData').resolves();

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getLocationData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetLocationData());
    });
  });

  //TODO: Fix issue with this test
  // describe('createProject', () => {
  //   afterEach(() => {
  //     sinon.restore();
  //   });

  //   it('returns project id on success', async () => {
  //     const mockRowObj = [{ id: 1 }];
  //     const mockQueryResponseGeneral = { rows: mockRowObj } as unknown as QueryResult<any>;
  //     const mockQueryResponseForAddProjectRole = { rowCount: 1 } as unknown as QueryResult<any>;
  //     const mockDBConnection = getMockDBConnection({
  //       query: async (a) =>
  //         a === 'valid sql projectParticipation' ? mockQueryResponseForAddProjectRole : mockQueryResponseGeneral,
  //       systemUserId: () => 1
  //     });

  //     const projectData = {
  //       contact: new projectCreateModels.PostContactData(),
  //       species: new projectCreateModels.PostSpeciesData(),
  //       project: new projectCreateModels.PostProjectData(),
  //       location: new projectCreateModels.PostLocationData({ geometry: [{ something: true }] }),
  //       funding: new projectCreateModels.PostFundingData(),
  //       iucn: new projectCreateModels.PostIUCNData(),
  //       partnership: new projectCreateModels.PostPartnershipsData(),
  //       objective: new projectCreateModels.PostObjectivesData(),
  //       authorization: new projectCreateModels.PostAuthorizationData(),
  //       focus: new projectCreateModels.PostFocusData(),
  //       restoration_plan: new projectCreateModels.PostRestPlanData()
  //     };

  //     const projectService = new ProjectService(mockDBConnection);

  //     const result = await projectService.createProject(projectData);

  //     expect(result).equals(mockRowObj[0].id);
  //   });

  //   it('works as expected with full project details', async () => {
  //     const mockRowObj = [{ id: 1 }];
  //     const mockQueryResponseGeneral = { rows: mockRowObj } as unknown as QueryResult<any>;
  //     const mockQueryResponseForAddProjectRole = { rowCount: 1 } as unknown as QueryResult<any>;
  //     const mockDBConnection = getMockDBConnection({
  //       query: async (a) =>
  //         a === 'valid sql projectParticipation' ? mockQueryResponseForAddProjectRole : mockQueryResponseGeneral,
  //       systemUserId: () => 1
  //     });

  //     const projectData = {
  //       project: {
  //         is_project: true,
  //         name: 'My project',
  //         state_code: 123,
  //         start_date: '1955-02-15',
  //         end_date: '2084-06-23',
  //         actual_start_date: 'string',
  //         actual_end_date: 'string',
  //         brief_desc: 'string',
  //         is_healing_land: true,
  //         is_healing_people: true,
  //         is_land_initiative: true,
  //         is_cultural_initiative: true,
  //         people_involved: 2,
  //         is_project_part_public_plan: true
  //       },
  //       species: { focal_species: [15573] },
  //       iucn: { classificationDetails: [{ classification: 3, subClassification1: 6, subClassification2: 35 }] },
  //       contact: {
  //         contacts: [
  //           {
  //             first_name: 'John',
  //             last_name: 'Smith',
  //             email_address: 'john@smith.com',
  //             agency: 'ABC Consulting',
  //             is_public: false,
  //             is_primary: true
  //           }
  //         ]
  //       },
  //       funding: {
  //         funding_sources: [
  //           {
  //             id: 0,
  //             agency_id: 20,
  //             agency_name: '',
  //             investment_action_category: 59,
  //             investment_action_category_name: '',
  //             agency_project_id: 'Agency123',
  //             funding_amount: 123,
  //             start_date: '2022-02-27',
  //             end_date: '2022-03-26',
  //             revision_count: 0
  //           }
  //         ]
  //       },
  //       partnership: { partnerships: [{ partnership: 'Canada Nature Fund' }, { partnership: 'BC Parks Living Labs' }] },
  //       objective: { objectives: [{ objective: 'This is objective 1' }, { objective: 'This is objective 2' }] },
  //       location: {
  //         geometry: [{} as unknown as Feature],
  //         is_within_overlapping: 'string',
  //         region: 3640,
  //         number_sites: 123,
  //         size_ha: 123,
  //         name_area_conservation_priority: ['string']
  //       },
  //       authorization: {
  //         authorizations: [
  //           {
  //             authorization_ref: 'authorization_ref',
  //             authorization_type: 'authorization_type'
  //           }
  //         ]
  //       },
  //       focus: { focuses: [1], people_involved: 2 },
  //       restoration_plan: { is_project_part_public_plan: true }
  //     };
  //     const projectService = new ProjectService(mockDBConnection);

  //     const result = await projectService.createProject(projectData);

  //     expect(result).equals(mockRowObj[0].id);
  //   });
  // });

  describe('insertProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertProject').resolves({ project_id: 1 } as any);

      const data = new projectCreateModels.PostProjectData();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertProject(data);

      expect(result).equals(1);
    });
  });

  describe('insertProjectSpatial', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon
        .stub(ProjectRepository.prototype, 'insertProjectLocation')
        .resolves({ project_spatial_component_id: 1 } as any);

      const data = new projectCreateModels.PostLocationData();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertProjectSpatial(data, 1);

      expect(result).equals(1);
    });
  });

  describe('insertFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertFundingSource').resolves({ project_funding_source_id: 1 } as any);

      const data = new projectCreateModels.PostFundingSource();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertFundingSource(data, 1);

      expect(result).equals(1);
    });
  });

  describe('insertPartnership', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertPartnership').resolves({ partnership_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertPartnership('string', 1);

      expect(result).equals(1);
    });
  });

  describe('insertObjective', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertObjective').resolves({ objective_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertObjective('string', 1);

      expect(result).equals(1);
    });
  });

  describe('insertPermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertPermit').resolves({ permit_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertPermit('string', 'string', 1);

      expect(result).equals(1);
    });
  });

  describe('insertClassificationDetail', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon
        .stub(ProjectRepository.prototype, 'insertClassificationDetail')
        .resolves({ project_iucn_action_classification_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertClassificationDetail(1, 1);

      expect(result).equals(1);
    });
  });

  describe('insertSpecies', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertSpecies').resolves({ project_species_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertSpecies(1, 1);

      expect(result).equals(1);
    });
  });

  describe('insertContact', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const data = new projectCreateModels.PostContactData();

      sinon.stub(ProjectRepository.prototype, 'insertProjectContact').resolves({ project_contact_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertContact(data[0], 1);

      expect(result).equals(1);
    });
  });

  describe('updateProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('makes no call to update entities', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: IUpdateProject = entitiesInitValue;

      const projectService = new ProjectService(mockDBConnection);

      const projectServiceSpy = sinon.spy(projectService);

      await projectService.updateProject(projectId, entities);
      expect(projectServiceSpy.updateProjectData).not.to.have.been.called;
      expect(projectServiceSpy.updateContactData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectIUCNData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectPartnershipsData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectObjectivesData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectFundingData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectSpatialData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectRegionData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectSpeciesData).not.to.have.been.called;
    });

    it('makes call to update entities', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: IUpdateProject = {
        project: new projectUpdateModels.PutProjectData(),
        contact: new projectCreateModels.PostContactData(),
        authorization: new projectCreateModels.PostAuthorizationData(),
        partnership: new projectUpdateModels.PutPartnershipsData(),
        objective: new projectUpdateModels.PutObjectivesData(),
        iucn: new projectUpdateModels.PutIUCNData(),
        funding: new projectUpdateModels.PutFundingData(),
        location: new projectUpdateModels.PutLocationData(),
        species: new projectUpdateModels.PutSpeciesData()
      };

      const projectService = new ProjectService(mockDBConnection);

      const projectServiceSpy = sinon.spy(projectService);

      try {
        await projectService.updateProject(projectId, entities);
      } catch (actualError) {
        expect(projectServiceSpy.updateProjectData).to.have.been.called;
        expect(projectServiceSpy.updateContactData).to.have.been.called;
        expect(projectServiceSpy.updateProjectIUCNData).to.have.been.called;
        expect(projectServiceSpy.updateProjectPartnershipsData).to.have.been.called;
        expect(projectServiceSpy.updateProjectObjectivesData).to.have.been.called;
        expect(projectServiceSpy.updateProjectFundingData).to.have.been.called;
        expect(projectServiceSpy.updateProjectSpatialData).to.have.been.called;
        expect(projectServiceSpy.updateProjectRegionData).to.have.been.called;
        expect(projectServiceSpy.updateProjectSpeciesData).to.have.been.called;
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });
  });

  describe('updateProjectData', () => {
    afterEach(() => {
      sinon.restore();
    });
  });

  describe('updateContactData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert the new contact information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        contact: {
          contacts: [
            {
              first_name: 'Katelyn',
              last_name: 'Williams',
              email_address: 'fuvaxacix@mailinator.com',
              agency: 'Non ut ullamco incid',
              is_public: 'true',
              is_primary: 'true'
            }
          ]
        }
      };

      const insertContactStub = sinon.stub(ProjectService.prototype, 'insertContact').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateContactData(projectId, entities);

      expect(insertContactStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectIUCNData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert the new iucn information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        iucn: {
          classificationDetails: [
            {
              classification: 1,
              subclassification1: 1,
              subclassification2: 1
            }
          ]
        }
      };

      const insertIUCNStub = sinon.stub(ProjectService.prototype, 'insertClassificationDetail').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectIUCNData(projectId, entities);

      expect(insertIUCNStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectPartnershipsData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert the new partnerships information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        partnership: {
          partnerships: ['partner1', 'partner2']
        }
      };

      const insertPartnershipStub = sinon.stub(ProjectService.prototype, 'insertPartnership').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectPartnershipsData(projectId, entities);

      expect(insertPartnershipStub).to.have.been.calledTwice;
    });
  });

  describe('updateProjectObjectivesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert the new objectives information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        objective: {
          objectives: ['objective1', 'objective2']
        }
      };

      const insertObjectiveStub = sinon.stub(ProjectService.prototype, 'insertObjective').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectObjectivesData(projectId, entities);

      expect(insertObjectiveStub).to.have.been.calledTwice;
    });
  });

  describe('updateProjectFundingData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert the new funding information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        funding: {
          fundingSources: [
            {
              agency_id: 16,
              agency_name: 'My agency',
              agency_project_id: 'ABC123',
              start_date: '2022-03-01',
              end_date: '2022-03-26',
              funding_amount: 222,
              id: 0,
              investment_action_category: 55,
              investment_action_category_name: '',
              revision_count: 0
            }
          ]
        }
      };

      const insertFundingSourceStub = sinon.stub(ProjectService.prototype, 'insertFundingSource').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectFundingData(projectId, entities);

      expect(insertFundingSourceStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectSpatialData', () => {
    afterEach(() => {
      sinon.restore();
    });
  });

  describe('updateProjectRegionData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when no sql statement produced for deleteProjectRegionSQL', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: new projectUpdateModels.PutLocationData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectRegionData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(500);
      }
    });
  });

  describe('updateProjectSpeciesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert the new species information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        species: {
          focal_species: [1, 2],
          focal_species_names: ['abc', 'def']
        }
      };

      const insertSpeciesStub = sinon.stub(ProjectService.prototype, 'insertSpecies').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectSpeciesData(projectId, entities);

      expect(insertSpeciesStub).to.have.been.calledTwice;
    });
  });

  describe('getProjectsByIds', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should get a project list that is not public', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectIds = [1, 2, 3];
      const isPublic = false;

      const getProjectByIdStub = sinon.stub(ProjectService.prototype, 'getProjectById').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.getProjectsByIds(projectIds, isPublic);

      expect(getProjectByIdStub).to.have.been.calledThrice;
    });
  });
});
