import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiError } from '../errors/custom-error';
import { UserObject } from '../models/user';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { UserRepository } from '../repositories/user-repository';
import * as user_utils from '../utils/user-utils';
import { ProjectService } from './project-service';
import { UserService } from './user-service';

chai.use(sinonChai);

describe('UserService', () => {
  describe('getUserById', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns a UserObject for the first row of the response', async function () {
      const mockResponseRow = { id: 123 };
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'getUserById').resolves(mockResponseRow as any);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserById(1);

      expect(result).to.eql(new UserObject(mockResponseRow));
    });
  });

  describe('getUserByGuid', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns a UserObject for the first row of the response', async function () {
      const mockResponseRow = { id: 123 };
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'getUserByGuid').resolves(mockResponseRow as any);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByGuid('identifier');

      expect(result).to.eql(new UserObject(mockResponseRow));
    });
  });

  describe('getUserByIdentifier', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns a UserObject for the first row of the response', async function () {
      const mockResponseRow = { id: 123 };
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'getUserByUserIdentifier').resolves(mockResponseRow as any);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByIdentifier('username', SYSTEM_IDENTITY_SOURCE.IDIR);

      expect(result).to.eql(new UserObject(mockResponseRow));
    });
  });

  describe('addSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should not throw an error on success', async () => {
      const mockRowObj = { id: 123 };
      const mockDBConnection = getMockDBConnection();

      const addSystemUserStub = sinon.stub(UserRepository.prototype, 'addSystemUser').resolves(mockRowObj as any);

      const userService = new UserService(mockDBConnection);

      const userGuid = '12345';
      const userIdentifier = 'username';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const result = await userService.addSystemUser(userGuid, userIdentifier, identitySource);

      expect(result).to.eql(new UserObject(mockRowObj));

      expect(addSystemUserStub).to.have.been.calledOnce;
    });
  });

  describe('listSystemUsers', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns a UserObject for each row of the response', async function () {
      const mockResponseRow1 = { id: 123 };
      const mockResponseRow2 = { id: 456 };
      const mockResponseRow3 = { id: 789 };
      const mockRowObj = [mockResponseRow1, mockResponseRow2, mockResponseRow3];

      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'getUserList').resolves(mockRowObj as any);

      const userService = new UserService(mockDBConnection);

      const result = await userService.listSystemUsers();

      expect(result).to.eql([
        new UserObject(mockResponseRow1),
        new UserObject(mockResponseRow2),
        new UserObject(mockResponseRow3)
      ]);
    });
  });

  describe('ensureSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if it fails to get the current system user id', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => null as unknown as number });

      const existingSystemUser = null;
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');
      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userGuid = '12345';
      const userIdentifier = 'username';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const userService = new UserService(mockDBConnection);

      try {
        await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to identify system user ID');
      }

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('adds a new system user if one does not already exist', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = null;
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addedSystemUser = new UserObject({ system_user_id: 2, record_end_date: null });
      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser').resolves(addedSystemUser);

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userGuid = '12345';
      const userIdentifier = 'username';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(undefined);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).to.have.been.calledOnce;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('gets an existing system user that is already activate', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingInactiveSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingInactiveSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userGuid = '12345';
      const userIdentifier = 'username';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(undefined);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('gets an existing system user that is not already active and re-activates it', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: '2021-11-22',
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const activatedSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByIdStub = sinon.stub(UserService.prototype, 'getUserById').resolves(activatedSystemUser);

      const userGuid = '12345';
      const userIdentifier = 'username';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(undefined);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).to.have.been.calledOnce;
      expect(getUserByIdStub).to.have.been.calledOnce;
    });
  });

  describe('activateSystemUser', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'activateSystemUser').resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.activateSystemUser(1);

      expect(result).to.be.undefined;
    });
  });

  describe('deactivateSystemUser', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'deactivateSystemUser').resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.deactivateSystemUser(1);

      expect(result).to.be.undefined;
    });
  });

  describe('deleteUserSystemRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'deleteUserSystemRoles').resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.deleteUserSystemRoles(1);

      expect(result).to.be.undefined;
    });
  });

  describe('deleteAllProjectRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'deleteAllProjectRoles').resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.deleteAllProjectRoles(1);

      expect(result).to.be.undefined;
    });
  });

  describe('addUserSystemRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserRepository.prototype, 'postSystemRoles').resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.addUserSystemRoles(1, [1]);

      expect(result).to.be.undefined;
    });
  });

  describe('getUserProjectParticipation', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns a ProjectParticipantObject for each row of the response', async function () {
      const mockResponseRow1 = {
        project_id: 123,
        project_name: 'string',
        system_user_id: 1,
        project_role_id: 1,
        project_role_name: 'string',
        project_participation_id: 1
      };
      const mockRowObj = [mockResponseRow1];

      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectParticipationRepository.prototype, 'getAllUserProjects').resolves(mockRowObj as any);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserProjectParticipation(1);

      expect(result).to.eql([
        {
          project_id: 123,
          name: 'string',
          system_user_id: 1,
          project_role_id: 1,
          project_role_name: 'string',
          project_participation_id: 1
        }
      ]);
    });
  });

  describe('handleDeleteSystemUser', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('throws error if user has record_end_date', async function () {
      const mockDBConnection = getMockDBConnection();

      const userService = new UserService(mockDBConnection);

      sinon.stub(UserService.prototype, 'getUserById').resolves({ record_end_date: '2021-11-22' } as any);

      try {
        await userService.handleDeleteSystemUser(1);
      } catch (err: any) {
        expect(err.message).to.equal('The system user is not active');
      }
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(UserService.prototype, 'getUserById').resolves({ record_end_date: null } as any);
      sinon.stub(UserService.prototype, 'deleteAllProjectRoles').resolves();
      sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
      sinon.stub(UserService.prototype, 'deactivateSystemUser').resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.handleDeleteSystemUser(1);

      expect(result).to.be.undefined;
    });
  });

  describe('handleDeleteProjectParticipant', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('throws error when delete project participation record fails', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves({ id: 1 } as any);
      sinon.stub(user_utils, 'doAllProjectsHaveAProjectLead').resolves(false);
      sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves();

      const userService = new UserService(mockDBConnection);

      try {
        await userService.handleDeleteProjectParticipant(1, 1);
      } catch (err: any) {
        expect(err.message).to.equal('Failed to delete project participant');
      }
    });

    it('returns undefined when project does not have another lead', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves({ id: 1 } as any);
      sinon.stub(user_utils, 'doAllProjectsHaveAProjectLead').resolves(false);
      sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 } as any);

      const userService = new UserService(mockDBConnection);

      const response = await userService.handleDeleteProjectParticipant(1, 1);
      expect(response).to.eql(undefined);
    });

    it('returns undefined when project has another lead', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves({ id: 1 } as any);
      sinon.stub(user_utils, 'doAllProjectsHaveAProjectLead').resolves(true);
      sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 } as any);

      const userService = new UserService(mockDBConnection);

      const response = await userService.handleDeleteProjectParticipant(1, 1);
      expect(response).to.eql(undefined);
    });

    it('throws error when project has another lead and delete project participation record fails', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves({ id: 1 } as any);
      sinon
        .stub(user_utils, 'doAllProjectsHaveAProjectLead')
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 } as any);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.handleDeleteProjectParticipant(1, 1);
      } catch (err: any) {
        expect(err.message).to.equal('Cannot delete project user. User is the only Project Lead for the project.');
      }
    });
  });

  describe('handleUpdateProjectParticipantRole', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('throws error when delete project participation record fails', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves({ id: 1 } as any);
      sinon.stub(user_utils, 'doAllProjectsHaveAProjectLead').resolves(false);
      sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves();

      const userService = new UserService(mockDBConnection);

      try {
        await userService.handleUpdateProjectParticipantRole(1, 1, 1);
      } catch (err: any) {
        expect(err.message).to.equal('Failed to update project participant role');
      }
    });

    it('returns undefined when project does not have another lead', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves({ id: 1 } as any);
      sinon.stub(user_utils, 'doAllProjectsHaveAProjectLead').resolves(false);
      sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'addProjectParticipant').resolves();

      const userService = new UserService(mockDBConnection);

      const response = await userService.handleUpdateProjectParticipantRole(1, 1, 1);
      expect(response).to.eql(undefined);
    });

    it('returns undefined when project has another lead', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves({ id: 1 } as any);
      sinon.stub(user_utils, 'doAllProjectsHaveAProjectLead').resolves(true);
      sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 } as any);
      sinon.stub(ProjectService.prototype, 'addProjectParticipant').resolves();

      const userService = new UserService(mockDBConnection);

      const response = await userService.handleUpdateProjectParticipantRole(1, 1, 1);
      expect(response).to.eql(undefined);
    });

    it('throws error when project has another lead and delete project participation record fails', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves({ id: 1 } as any);

      sinon
        .stub(user_utils, 'doAllProjectsHaveAProjectLead')
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 } as any);

      sinon.stub(ProjectService.prototype, 'addProjectParticipant').resolves();

      const userService = new UserService(mockDBConnection);

      try {
        await userService.handleUpdateProjectParticipantRole(1, 1, 1);
      } catch (err: any) {
        expect(err.message).to.equal('Cannot delete project user. User is the only Project Lead for the project.');
      }
    });
  });
});
