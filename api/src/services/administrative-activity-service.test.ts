import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../constants/administrative-activity';
import { AdministrativeActivityRepository } from '../repositories/administrative-activity-repository';
import { AdministrativeActivityService } from './administrative-activity-service';

chai.use(sinonChai);

describe('AdministrativeActivityService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getAdministrativeActivities', () => {
    it('should get administrative activities', async () => {
      const connection = getMockDBConnection();
      const administrativeActivityService = new AdministrativeActivityService(connection);
      const getAdministrativeActivitiesStub = sinon
        .stub(AdministrativeActivityRepository.prototype, 'getAdministrativeActivities')
        .resolves([]);

      const response = await administrativeActivityService.getAdministrativeActivities();

      expect(getAdministrativeActivitiesStub).to.have.been.calledOnce;
      expect(response).to.eql([]);
    });
  });

  describe('createPendingAccessRequest', () => {
    it('should create a pending access request', async () => {
      const connection = getMockDBConnection();
      const administrativeActivityService = new AdministrativeActivityService(connection);
      const createPendingAccessRequestStub = sinon
        .stub(AdministrativeActivityRepository.prototype, 'createPendingAccessRequest')
        .resolves({ id: 1 } as any);

      const response = await administrativeActivityService.createPendingAccessRequest(1, {});

      expect(createPendingAccessRequestStub).to.have.been.calledOnce;
      expect(response).to.eql({ id: 1 });
    });
  });

  describe('putAdministrativeActivity', () => {
    it('should update an administrative activity', async () => {
      const connection = getMockDBConnection();
      const administrativeActivityService = new AdministrativeActivityService(connection);
      const putAdministrativeActivityStub = sinon
        .stub(AdministrativeActivityRepository.prototype, 'putAdministrativeActivity')
        .resolves({ id: 1 } as any);

      const response = await administrativeActivityService.putAdministrativeActivity(
        1,
        ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.ACTIONED
      );

      expect(putAdministrativeActivityStub).to.have.been.calledOnce;
      expect(response).to.eql({ id: 1 });
    });
  });

  describe('countPendingAdministrativeActivities', () => {
    it('should count pending administrative activities', async () => {
      const connection = getMockDBConnection();
      const administrativeActivityService = new AdministrativeActivityService(connection);
      const countPendingAdministrativeActivitiesStub = sinon
        .stub(AdministrativeActivityRepository.prototype, 'countPendingAdministrativeActivities')
        .resolves(1);

      const response = await administrativeActivityService.countPendingAdministrativeActivities('guid');

      expect(countPendingAdministrativeActivitiesStub).to.have.been.calledOnce;
      expect(response).to.eql(1);
    });
  });

  describe('getAdministrativeActivityStanding', () => {
    it('should get an administrative activity standing', async () => {
      const connection = getMockDBConnection();
      const administrativeActivityService = new AdministrativeActivityService(connection);
      const getAdministrativeActivityStandingStub = sinon
        .stub(AdministrativeActivityRepository.prototype, 'getAdministrativeActivityStanding')
        .resolves({ id: 1 } as any);

      const response = await administrativeActivityService.getAdministrativeActivityStanding('guid');

      expect(getAdministrativeActivityStandingStub).to.have.been.calledOnce;
      expect(response).to.eql({ id: 1 });
    });
  });
});
