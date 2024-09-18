import chai, { expect } from 'chai';
import { Feature } from 'geojson';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { HTTPError } from '../errors/custom-error';
import * as projectCreateModels from '../models/project-create';
import * as projectUpdateModels from '../models/project-update';
import * as projectViewModels from '../models/project-view';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import * as file_utils from '../utils/file-utils';
import * as user_utils from '../utils/user-utils';
import { ProjectService } from './project-service';
chai.use(sinonChai);

const entitiesInitValue = {
  project: null,
  contact: null,
  authorization: null,
  partnership: null,
  objective: null,
  funding: null,
  location: null,
  species: null
};

describe('ProjectService', () => {
  describe('ensureProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const ensureProjectParticipationStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'ensureProjectParticipation')
        .resolves(true);

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
        .resolves(false);

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      await projectService.ensureProjectParticipant(systemUserId, projectId, projectParticipantRoleId);

      expect(ensureProjectParticipationStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).to.have.been.calledOnce;
    });
  });

  describe('getProjectParticipants', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns the first row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectParticipationRepository.prototype, 'getAllProjectParticipants').resolves([]);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.eql([]);
    });
  });

  describe('getProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if no user is found', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipant').resolves(null);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipant(projectId, 1);

      expect(result).to.eql(null);
    });

    it('returns rows on success', async () => {
      const mockRowObj = [{ id: 123 }];
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipant').resolves(mockRowObj as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipant(projectId, 1);

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

  describe('checkIfUserIsOnlyProjectLeadOnAnyProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return false if no user is found', async () => {
      const mockDBConnection = getMockDBConnection();

      const getParticipantsFromAllSystemUsersProjectsStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getParticipantsFromAllSystemUsersProjects')
        .resolves([]);

      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.checkIfUserIsOnlyProjectLeadOnAnyProject(systemUserId);

      expect(result).to.equal(undefined);
      expect(getParticipantsFromAllSystemUsersProjectsStub).to.have.been.calledOnce;
    });

    it('should throw error if user is not the only Lead Editor', async () => {
      const mockDBConnection = getMockDBConnection();

      const getParticipantsFromAllSystemUsersProjectsStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getParticipantsFromAllSystemUsersProjects')
        .resolves([{ id: 1 } as any]);

      sinon.stub(user_utils, 'doAllProjectsHaveAProjectLeadIfUserIsRemoved').returns(false);

      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.checkIfUserIsOnlyProjectLeadOnAnyProject(systemUserId);
      } catch (actualError: any) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect(actualError.message).to.equal(
          'Cannot remove user. User is the only Lead Editor for one or more projects.'
        );
        expect(getParticipantsFromAllSystemUsersProjectsStub).to.have.been.calledOnce;
      }
    });

    it('should return undefined if user is not the only Lead Editor', async () => {
      const mockDBConnection = getMockDBConnection();

      const getParticipantsFromAllSystemUsersProjectsStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getParticipantsFromAllSystemUsersProjects')
        .resolves([{ id: 1 } as any]);

      sinon.stub(user_utils, 'doAllProjectsHaveAProjectLeadIfUserIsRemoved').returns(true);

      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.checkIfUserIsOnlyProjectLeadOnAnyProject(systemUserId);

      expect(result).to.equal(undefined);
      expect(getParticipantsFromAllSystemUsersProjectsStub).to.have.been.calledOnce;
    });
  });

  describe('getProjectById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getSpeciesData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getContactData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getAuthorizationData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getPartnershipsData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getObjectivesData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getFundingData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getLocationData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectById(projectId);

      expect(result).to.eql({
        project: { id: 1 },
        species: { id: 1 },
        contact: { id: 1 },
        authorization: { id: 1 },
        partnership: { id: 1 },
        objective: { id: 1 },
        funding: { id: 1 },
        location: { id: 1 }
      });
    });
  });

  describe('getProjectByIdForEdit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success no attachment data', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getSpeciesData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getContactData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getAuthorizationData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getPartnershipsData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getObjectivesData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getFundingData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getLocationData').resolves({ id: 1 } as any);
      sinon.stub(AttachmentRepository.prototype, 'getProjectAttachmentsByType').resolves([]);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectByIdForEdit(projectId);

      expect(result).to.eql({
        project: { id: 1, image_url: '', image_key: '' },
        species: { id: 1 },
        contact: { id: 1 },
        authorization: { id: 1 },
        partnership: { id: 1 },
        objective: { id: 1 },
        funding: { id: 1 },
        location: { id: 1 }
      });
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getSpeciesData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getContactData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getAuthorizationData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getPartnershipsData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getObjectivesData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getFundingData').resolves({ id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'getLocationData').resolves({ id: 1 } as any);
      sinon
        .stub(AttachmentRepository.prototype, 'getProjectAttachmentsByType')
        .resolves([{ id: 1, key: 'key' } as any]);

      sinon.stub(file_utils, 'getS3SignedURL').resolves('string');

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectByIdForEdit(projectId);

      expect(result).to.eql({
        project: { id: 1, image_url: 'string', image_key: 'key' },
        species: { id: 1 },
        contact: { id: 1 },
        authorization: { id: 1 },
        partnership: { id: 1 },
        objective: { id: 1 },
        funding: { id: 1 },
        location: { id: 1 }
      });
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

  describe('getSpeciesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getProjectSpecies').resolves([{ itis_tsn: 1 } as any]);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getSpeciesData(projectId);

      expect(result).to.eql({ focal_species: [1] });
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

  describe('getAuthorizationData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getAuthorizationData').resolves({ id: 1 } as any);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getAuthorizationData(projectId);

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
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getObjectivesData').resolves([{ id: 1 } as any]);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getObjectivesData(projectId);

      expect(result).to.eql({ objectives: [{ id: 1 }] });
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

      const result = await projectService.getFundingData(projectId, false);

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
      sinon.stub(ProjectRepository.prototype, 'getConservationAreasData').resolves();

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getLocationData(projectId, false);

      expect(result).to.deep.include(new projectViewModels.GetLocationData());
    });
  });

  describe('getSpatialSearch', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns row on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'getSpatialSearch').resolves({ id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getSpatialSearch(true, 1);

      expect(result).to.eql({ id: 1 });
    });
  });

  describe('createProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectData = {
        contact: new projectCreateModels.PostContactData(),
        species: new projectCreateModels.PostSpeciesData(),
        project: new projectCreateModels.PostProjectData(),
        location: new projectCreateModels.PostLocationData({ geometry: [{ something: true }] }),
        funding: new projectCreateModels.PostFundingData(),
        partnership: new projectCreateModels.PostPartnershipsData(),
        objective: new projectCreateModels.PostObjectivesData(),
        authorization: new projectCreateModels.PostAuthorizationData(),
        focus: new projectCreateModels.PostFocusData(),
        restoration_plan: new projectCreateModels.PostRestPlanData()
      };

      sinon.stub(ProjectService.prototype, 'insertProject').resolves(1);
      sinon.stub(ProjectService.prototype, 'insertContact').resolves();
      sinon.stub(ProjectService.prototype, 'insertProjectSpatial').resolves();
      sinon.stub(ProjectService.prototype, 'insertFundingSource').resolves();
      sinon.stub(ProjectService.prototype, 'insertPartnership').resolves();
      sinon.stub(ProjectService.prototype, 'insertObjective').resolves();
      sinon.stub(ProjectService.prototype, 'insertConservationArea').resolves();
      sinon.stub(ProjectService.prototype, 'insertAuthorization').resolves();
      sinon.stub(ProjectService.prototype, 'insertProjectRegion').resolves();
      sinon.stub(ProjectService.prototype, 'insertFocus').resolves();
      sinon.stub(ProjectService.prototype, 'insertRestPlan').resolves();
      sinon.stub(ProjectService.prototype, 'insertProjectParticipantRole').resolves();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.createProject(projectData);

      expect(result).equals(1);
    });

    it('works as expected with full project details', async () => {
      const mockDBConnection = getMockDBConnection({});

      const projectData = {
        project: {
          is_project: true,
          name: 'My project',
          state_code: 123,
          start_date: '1955-02-15',
          end_date: '2084-06-23',
          actual_start_date: 'string',
          actual_end_date: 'string',
          brief_desc: 'string',
          is_healing_land: true,
          is_healing_people: true,
          is_land_initiative: true,
          is_cultural_initiative: true,
          people_involved: 2,
          is_project_part_public_plan: true
        },
        species: { focal_species: [15573] },
        iucn: { classificationDetails: [{ classification: 3, subClassification1: 6, subClassification2: 35 }] },
        contact: {
          contacts: [
            {
              first_name: 'John',
              last_name: 'Smith',
              email_address: 'john@smith.com',
              organization: 'ABC Consulting',
              is_public: false,
              is_primary: true,
              phone_number: '123-456-7890',
              is_first_nation: true
            }
          ]
        },
        funding: {
          funding_sources: [
            {
              id: 0,
              organization_id: 20,
              organization_name: '',
              investment_action_category: 59,
              investment_action_category_name: '',
              organization_project_id: 'Agency123',
              funding_amount: 123,
              start_date: '2022-02-27',
              end_date: '2022-03-26',
              revision_count: 0,
              description: 'desc',
              funding_project_id: '1',
              is_public: false
            }
          ]
        },
        partnership: {
          partnerships: [
            { partnership_type: 'id', partnership_ref: 'id', partnership_name: 'name' },
            { partnership_type: 'id', partnership_ref: 'id', partnership_name: 'name' }
          ]
        },
        objective: { objectives: [{ objective: 'This is objective 1' }, { objective: 'This is objective 2' }] },
        location: {
          geometry: [{} as unknown as Feature],
          is_within_overlapping: 'string',
          region: 3640,
          number_sites: 123,
          size_ha: 123,
          name_area_conservation_priority: ['string'],
          conservationAreas: [{ conservationArea: 'string', isPublic: false }]
        },
        authorization: {
          authorizations: [
            {
              authorization_ref: 'authorization_ref',
              authorization_type: 'authorization_type',
              authorization_desc: 'authorization_desc'
            }
          ]
        },
        focus: { focuses: [1], people_involved: 2 },
        restoration_plan: { is_project_part_public_plan: true }
      };

      sinon.stub(ProjectService.prototype, 'insertProject').resolves(1);
      sinon.stub(ProjectService.prototype, 'insertContact').resolves();
      sinon.stub(ProjectService.prototype, 'insertProjectSpatial').resolves();
      sinon.stub(ProjectService.prototype, 'insertFundingSource').resolves();
      sinon.stub(ProjectService.prototype, 'insertPartnership').resolves();
      sinon.stub(ProjectService.prototype, 'insertObjective').resolves();
      sinon.stub(ProjectService.prototype, 'insertConservationArea').resolves();
      sinon.stub(ProjectService.prototype, 'insertAuthorization').resolves();
      sinon.stub(ProjectService.prototype, 'insertProjectRegion').resolves();
      sinon.stub(ProjectService.prototype, 'insertFocus').resolves();
      sinon.stub(ProjectService.prototype, 'insertRestPlan').resolves();
      sinon.stub(ProjectService.prototype, 'insertProjectParticipantRole').resolves();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.createProject(projectData);

      expect(result).equals(1);
    });
  });

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

      const result = await projectService.insertProjectSpatial({ ...data, geometry: [{ id: 1 } as any] }, 1);

      expect(result).equals(1);
    });
  });

  describe('insertProjectRegion', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertProjectRegion').resolves({ nrm_region_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertProjectRegion(1, 1);

      expect(result).equals(1);
    });
  });

  describe('insertFocus', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'updateProjectFocus').resolves({ project_id: 1 } as any);

      const data = new projectCreateModels.PostFocusData();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertFocus(data, 1);

      expect(result).equals(1);
    });
  });

  describe('insertRestPlan', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertProjectRestPlan').resolves({ project_id: 1 } as any);

      const data = new projectCreateModels.PostRestPlanData();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertRestPlan(data, 1);

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

      sinon.stub(ProjectRepository.prototype, 'insertPartnership').resolves({ project_partnership_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertPartnership(
        { partnership_type: 'id', partnership_ref: 'id', partnership_name: 'name' },
        1
      );

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

  describe('insertConservationArea', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertConservationArea').resolves({ conservation_area_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertConservationArea('string', false, 1);

      expect(result).equals(1);
    });
  });

  describe('insertAuthorization', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectRepository.prototype, 'insertAuthorization').resolves({ permit_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertAuthorization('string', 'string', 'string', 1);

      expect(result).equals(1);
    });
  });

  describe('insertProjectParticipantRole', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws error if no user is found', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectParticipationRepository.prototype, 'insertProjectParticipantByRoleName').resolves(null);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProjectParticipantRole(1, 'string');
      } catch (actualError: any) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect(actualError.message).to.equal('Failed to identify system user ID');
      }
    });

    it('returns id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(mockDBConnection, 'systemUserId').returns(1);

      sinon
        .stub(ProjectParticipationRepository.prototype, 'insertProjectParticipantByRoleName')
        .resolves({ project_participant_role_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertProjectParticipantRole(1, 'string');

      expect(result).eql({ project_participant_role_id: 1 });
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

  describe('updateProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectData = {
        contact: new projectCreateModels.PostContactData(),
        species: new projectCreateModels.PostSpeciesData(),
        project: new projectCreateModels.PostProjectData(),
        location: new projectCreateModels.PostLocationData({ geometry: [{ something: true }] }),
        funding: new projectCreateModels.PostFundingData(),
        partnership: new projectCreateModels.PostPartnershipsData(),
        objective: new projectCreateModels.PostObjectivesData(),
        authorization: new projectCreateModels.PostAuthorizationData(),
        focus: new projectCreateModels.PostFocusData(),
        restoration_plan: new projectCreateModels.PostRestPlanData()
      };

      sinon.stub(ProjectService.prototype, 'updateProjectData').resolves();
      sinon.stub(ProjectRepository.prototype, 'updateProjectFocus').resolves();
      sinon.stub(ProjectService.prototype, 'updateContactData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectPartnershipsData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectObjectivesData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectFundingData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectAuthorizationData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectSpatialData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectRegionData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectConservationAreaData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectSpeciesData').resolves();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.updateProject(1, projectData);

      expect(result).equals(undefined);
    });
  });

  describe('updateProjectData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw error if no data is found', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectData(1, undefined as any);
      } catch (actualError: any) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect(actualError.message).to.equal('Failed to parse request body');
      }
    });

    it('returns project id on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectData = {
        is_project: true,
        name: 'My project',
        state_code: 123,
        start_date: '1955-02-15',
        end_date: '2084-06-23',
        actual_start_date: 'string',
        actual_end_date: 'string',
        brief_desc: 'string',
        is_healing_land: true,
        is_healing_people: true,
        is_land_initiative: true,
        is_cultural_initiative: true,
        people_involved: 2,
        is_project_part_public_plan: true
      };

      sinon.stub(ProjectRepository.prototype, 'updateProject').resolves({ project_id: 1 } as any);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.updateProjectData(1, projectData);

      expect(result).equals(undefined);
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
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        contact: {
          contacts: [
            {
              first_name: 'Katelyn',
              last_name: 'Williams',
              email_address: 'fuvaxacix@mailinator.com',
              organization: 'Non ut ullamco incid',
              is_public: true,
              is_primary: true,
              is_first_nation: true,
              phone_number: '123-456-7890'
            }
          ]
        } as any
      } as any;

      const insertContactStub = sinon.stub(ProjectService.prototype, 'insertContact').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateContactData(projectId, entities.contact);

      expect(insertContactStub).to.have.been.calledOnce;
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
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        partnership: {
          partnerships: [{ partnership: 'partner1' }, { partnership: 'partner2' }]
        }
      } as any;

      const insertPartnershipStub = sinon.stub(ProjectService.prototype, 'insertPartnership').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectPartnershipsData(projectId, entities.partnership);

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
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        objective: {
          objectives: [{ objective: 'objective1' }, { objective: 'objective2' }]
        }
      } as any;

      const insertObjectiveStub = sinon.stub(ProjectService.prototype, 'insertObjective').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectObjectivesData(projectId, entities.objective);

      expect(insertObjectiveStub).to.have.been.calledTwice;
    });
  });

  describe('updateProjectFundingData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert the new funding information', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        funding: {
          funding_sources: [
            {
              id: 0,
              organization_id: 20,
              organization_name: '',
              investment_action_category: 59,
              investment_action_category_name: '',
              organization_project_id: 'Agency123',
              funding_amount: 123,
              start_date: '2022-02-27',
              end_date: '2022-03-26',
              revision_count: 0,
              description: 'desc',
              funding_project_id: '1',
              is_public: false
            }
          ]
        }
      } as any;

      sinon.stub(ProjectRepository.prototype, 'deleteProjectFundingSource').resolves();
      const insertFundingSourceStub = sinon.stub(ProjectService.prototype, 'insertFundingSource').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectFundingData(projectId, entities.funding);

      expect(insertFundingSourceStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectAuthorizationData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert the new authorization information', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        authorization: {
          authorizations: [
            {
              authorization_ref: 'authorization_ref',
              authorization_type: 'authorization_type',
              authorization_desc: 'authorization_desc'
            }
          ]
        }
      } as any;

      sinon.stub(ProjectRepository.prototype, 'deleteProjectAuthorization').resolves();
      const insertAuthorizationStub = sinon.stub(ProjectService.prototype, 'insertAuthorization').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectAuthorizationData(projectId, entities.authorization);

      expect(insertAuthorizationStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectSpatialData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return undefined if no location is to insert', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        location: { geometry: [] }
      } as any;

      const deleteProjectLocationStub = sinon.stub(ProjectRepository.prototype, 'deleteProjectLocation').resolves();
      sinon.stub(ProjectService.prototype, 'insertProjectSpatial').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectSpatialData(projectId, entities.location);

      expect(deleteProjectLocationStub).to.have.been.calledOnce;
    });

    it('should insert the new spatial information', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        location: { geometry: [{ id: 1 } as any] }
      } as any;

      sinon.stub(ProjectRepository.prototype, 'deleteProjectLocation').resolves();
      const insertProjectSpatialStub = sinon.stub(ProjectService.prototype, 'insertProjectSpatial').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectSpatialData(projectId, entities.location);

      expect(insertProjectSpatialStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectRegionData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return undefined if no region is to insert', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        location: { region: null }
      } as any;

      const deleteProjectRegionStub = sinon.stub(ProjectRepository.prototype, 'deleteProjectRegion').resolves();
      sinon.stub(ProjectService.prototype, 'insertProjectRegion').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectRegionData(projectId, entities.location);

      expect(deleteProjectRegionStub).to.have.been.calledOnce;
    });

    it('should insert the new region information', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;

      sinon.stub(ProjectRepository.prototype, 'deleteProjectRegion').resolves();
      const insertProjectRegionStub = sinon.stub(ProjectRepository.prototype, 'insertProjectRegion').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectRegionData(projectId, { region: 3640 } as any);

      expect(insertProjectRegionStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectConservationAreaData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return undefined if no conservation area is to insert', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        location: { conservationAreas: [] }
      } as any;

      const deleteProjectConservationAreaStub = sinon
        .stub(ProjectRepository.prototype, 'deleteProjectConservationArea')
        .resolves();
      sinon.stub(ProjectService.prototype, 'insertConservationArea').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectConservationAreaData(projectId, entities.location);

      expect(deleteProjectConservationAreaStub).to.have.been.calledOnce;
    });

    it('should insert the new conservation area information', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        location: { conservationAreas: [{ conservationArea: 'string' }] }
      } as any;

      sinon.stub(ProjectRepository.prototype, 'deleteProjectConservationArea').resolves();
      const insertConservationAreaStub = sinon.stub(ProjectService.prototype, 'insertConservationArea').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectConservationAreaData(projectId, entities.location);

      expect(insertConservationAreaStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectSpeciesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return undefined if no species is to insert', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;

      const deleteProjectConservationAreaStub = sinon
        .stub(ProjectRepository.prototype, 'deleteProjectSpecies')
        .resolves();
      sinon.stub(ProjectService.prototype, 'insertSpecies').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectSpeciesData(projectId, { focal_species: [] } as any);

      expect(deleteProjectConservationAreaStub).to.have.been.calledOnce;
    });

    it('should insert the new species information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: projectUpdateModels.PutProjectObject = {
        ...entitiesInitValue,
        species: {
          focal_species: [1, 2]
        }
      } as any;

      const insertSpeciesStub = sinon.stub(ProjectService.prototype, 'insertSpecies').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectSpeciesData(projectId, entities.species);

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

  describe('deleteProjectParticipationRecord', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete a project participation record', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectService = new ProjectService(mockDBConnection);

      sinon.stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord').resolves(1);

      const response = await projectService.deleteProjectParticipationRecord(1);

      expect(response).to.eql(1);
    });
  });

  describe('deleteProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete a project', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectService = new ProjectService(mockDBConnection);

      sinon.stub(ProjectRepository.prototype, 'deleteProject').resolves();

      const response = await projectService.deleteProject(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('deleteFundingSourceById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete a funding source', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectService = new ProjectService(mockDBConnection);

      sinon.stub(ProjectRepository.prototype, 'deleteFundingSourceById').resolves({ project_funding_source_id: 1 });

      const response = await projectService.deleteFundingSourceById(1, 1);

      expect(response).to.eql({ project_funding_source_id: 1 });
    });
  });
});
