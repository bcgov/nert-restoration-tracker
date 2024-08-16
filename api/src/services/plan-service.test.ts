import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { PlanRepository } from '../repositories/plan-repository';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import * as file_utils from '../utils/file-utils';
import { AttachmentService } from './attachment-service';
import { PlanService } from './plan-service';
import { ProjectService } from './project-service';

chai.use(sinonChai);

describe('PlanService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getPlansByIds', () => {
    it('should get plans by IDs', async () => {
      const connection = getMockDBConnection();
      const planService = new PlanService(connection);
      const getPlanByIdStub = sinon.stub(PlanService.prototype, 'getPlanById').resolves({} as any);

      const response = await planService.getPlansByIds([1, 2]);

      expect(getPlanByIdStub).to.have.been.calledTwice;
      expect(response).to.eql([{}, {}]);
    });
  });

  describe('getPlanById', () => {
    it('should get a plan by ID', async () => {
      const connection = getMockDBConnection();
      const planService = new PlanService(connection);
      const getProjectDataStub = sinon.stub(planService.projectRepository, 'getProjectData').resolves({} as any);
      const getContactDataStub = sinon.stub(planService.projectRepository, 'getContactData').resolves({} as any);
      const getLocationDataStub = sinon.stub(planService.projectService, 'getLocationData').resolves({} as any);

      const response = await planService.getPlanById(1);

      expect(getProjectDataStub).to.have.been.calledOnce;
      expect(getContactDataStub).to.have.been.calledOnce;
      expect(getLocationDataStub).to.have.been.calledOnce;
      expect(response).to.eql({ project: {}, contact: {}, location: {} });
    });
  });

  describe('getPlanByIdForEdit', () => {
    it('should get a plan by ID for edit with no thumbnail', async () => {
      const connection = getMockDBConnection();
      const planService = new PlanService(connection);
      const getProjectDataStub = sinon.stub(planService.projectRepository, 'getProjectData').resolves({} as any);
      const getContactDataStub = sinon.stub(planService.projectRepository, 'getContactData').resolves({} as any);
      const getLocationDataStub = sinon.stub(planService.projectService, 'getLocationData').resolves({} as any);

      sinon.stub(AttachmentRepository.prototype, 'getProjectAttachmentsByType').resolves([]);

      const response = await planService.getPlanByIdForEdit(1);

      expect(getProjectDataStub).to.have.been.calledOnce;
      expect(getContactDataStub).to.have.been.calledOnce;
      expect(getLocationDataStub).to.have.been.calledOnce;
      expect(response).to.eql({ project: {}, contact: {}, location: {} });
    });

    it('should get a plan by ID for edit with thumbnail', async () => {
      const connection = getMockDBConnection();
      const planService = new PlanService(connection);
      const getProjectDataStub = sinon.stub(planService.projectRepository, 'getProjectData').resolves({} as any);
      const getContactDataStub = sinon.stub(planService.projectRepository, 'getContactData').resolves({} as any);
      const getLocationDataStub = sinon.stub(planService.projectService, 'getLocationData').resolves({} as any);

      sinon.stub(AttachmentRepository.prototype, 'getProjectAttachmentsByType').resolves([{ key: 'string' } as any]);
      sinon.stub(file_utils, 'getS3SignedURL').resolves('url');

      const response = await planService.getPlanByIdForEdit(1);

      expect(getProjectDataStub).to.have.been.calledOnce;
      expect(getContactDataStub).to.have.been.calledOnce;
      expect(getLocationDataStub).to.have.been.calledOnce;
      expect(response).to.eql({
        project: { image_url: 'url', image_key: 'string' },
        contact: {},
        location: {}
      });
    });
  });

  describe('createPlan', () => {
    it('should create a plan', async () => {
      const connection = getMockDBConnection();
      const planService = new PlanService(connection);
      const systemUserIdStub = sinon.stub(connection, 'systemUserId').returns(1);

      sinon.stub(PlanRepository.prototype, 'insertPlan').resolves({ project_id: 1 });
      sinon.stub(ProjectRepository.prototype, 'insertProjectContact').resolves();
      sinon.stub(ProjectRepository.prototype, 'updateProjectFocus').resolves();
      sinon.stub(ProjectRepository.prototype, 'insertProjectLocation').resolves();
      sinon.stub(ProjectRepository.prototype, 'insertProjectRegion').resolves();
      sinon.stub(ProjectParticipationRepository.prototype, 'insertProjectParticipantByRoleName').resolves();

      const obj = {
        contact: {
          contacts: [
            {
              first_name: 'first',
              last_name: 'last',
              email_address: 'email@example.com',
              organization: 'organization',
              is_public: true,
              is_primary: true,
              is_first_nation: true,
              phone_number: '222-222-2222'
            }
          ]
        },
        project: {
          project_name: 'name_test_data',
          start_date: 'start_date_test_data',
          end_date: 'end_date_test_data',
          objectives: 'these are the project objectives',
          is_project: true,
          name: 'string;',
          state_code: 1,
          actual_start_date: 'string;',
          actual_end_date: 'string;',
          brief_desc: 'string;',
          is_healing_land: true,
          is_healing_people: true,
          is_land_initiative: true,
          is_cultural_initiative: true
        },
        location: {
          geometry: [
            {
              type: 'Feature',
              geometry: [
                [
                  [-128, 55],
                  [-128, 55.5],
                  [-128, 56],
                  [-126, 58],
                  [-128, 55]
                ]
              ],
              properties: {
                name: 'Restoration Islands'
              }
            } as any
          ],
          is_within_overlapping: 'T',
          region: 1,
          number_sites: 1,
          size_ha: 1,
          conservationAreas: [{ conservationArea: 'string' }]
        },
        focus: { focuses: [1, 2], people_involved: 2 }
      };

      const response = await planService.createPlan(obj);

      expect(systemUserIdStub).to.have.been.calledOnce;
      expect(response).to.eql({ project_id: 1 });
    });
  });

  describe('updatePlan', () => {
    it('should update a plan', async () => {
      const connection = getMockDBConnection();
      const planService = new PlanService(connection);

      sinon.stub(PlanRepository.prototype, 'updatePlan').resolves({ project_id: 1 });
      sinon.stub(ProjectRepository.prototype, 'updateProjectFocus').resolves();
      sinon.stub(ProjectRepository.prototype, 'deleteProjectContact').resolves();
      sinon.stub(ProjectRepository.prototype, 'insertProjectContact').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectSpatialData').resolves();
      sinon.stub(ProjectService.prototype, 'updateProjectRegionData').resolves();

      const obj = {
        contact: {
          contacts: [
            {
              first_name: 'first',
              last_name: 'last',
              email_address: 'email@example.com',
              organization: 'organization',
              is_public: true,
              is_primary: true,
              is_first_nation: true,
              phone_number: '222-222-2222'
            }
          ]
        },
        project: {
          project_name: 'name_test_data',
          start_date: 'start_date_test_data',
          end_date: 'end_date_test_data',
          objectives: 'these are the project objectives',
          is_project: true,
          name: 'string;',
          state_code: 1,
          actual_start_date: 'string;',
          actual_end_date: 'string;',
          brief_desc: 'string;',
          is_healing_land: true,
          is_healing_people: true,
          is_land_initiative: true,
          is_cultural_initiative: true
        },
        location: {
          geometry: [
            {
              type: 'Feature',
              geometry: [
                [
                  [-128, 55],
                  [-128, 55.5],
                  [-128, 56],
                  [-126, 58],
                  [-128, 55]
                ]
              ],
              properties: {
                name: 'Restoration Islands'
              }
            } as any
          ],
          is_within_overlapping: 'T',
          region: 1,
          number_sites: 1,
          size_ha: 1,
          conservationAreas: [{ conservationArea: 'string' }]
        },
        focus: { focuses: [1, 2], people_involved: 2 }
      };

      const response = await planService.updatePlan(1, obj);

      expect(response).to.eql({ project_id: 1 });
    });
  });

  describe('deletePlan', () => {
    it('should delete all s3 attachments and then delete plan', async () => {
      const connection = getMockDBConnection();
      const planService = new PlanService(connection);

      sinon.stub(AttachmentService.prototype, 'deleteAllS3Attachments').resolves();
      sinon.stub(ProjectRepository.prototype, 'deleteProject').resolves();

      await planService.deletePlan(1);
    });
  });
});
