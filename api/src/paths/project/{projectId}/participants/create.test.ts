import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { ProjectService } from '../../../../services/project-service';
import { UserService } from '../../../../services/user-service';
import * as create_project_participants from './create';

chai.use(sinonChai);

describe('createProjectParticipants', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      participants: [['jsmith', 'IDIR', 1]]
    },
    params: {
      projectId: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId in the param', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_project_participants.createProjectParticipants();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `projectId`');
    }
  });

  it('should throw a 400 error when no participants in the request body', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_project_participants.createProjectParticipants();
      await result(
        { ...sampleReq, body: { ...sampleReq.body, participants: [] } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param `participants`');
    }
  });

  it('should catch and re-throw an error thrown by ensureSystemUserAndProjectParticipantUser', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: null
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(UserService.prototype, 'ensureSystemUser').rejects(new Error('an error'));

    try {
      const result = create_project_participants.createProjectParticipants();
      await result({ ...sampleReq }, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should return successfully when no errors are thrown', async () => {
    const mockQuery = sinon.stub();
    const { mockRes, mockNext } = getRequestHandlerMocks();
    mockQuery.resolves({
      rows: null
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(UserService.prototype, 'ensureSystemUser').resolves({ id: 1 } as any);
    sinon.stub(create_project_participants, 'ensureSystemUserAndProjectParticipantUser').resolves();

    const result = create_project_participants.createProjectParticipants();
    await result({ ...sampleReq }, mockRes, mockNext);
  });
});

describe('ensureSystemUserAndProjectParticipantUser', () => {
  const dbConnectionObj = getMockDBConnection();

  afterEach(() => {
    sinon.restore();
  });

  it('should catch and re-throw an error thrown by ensureSystemUser', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: null
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(UserService.prototype, 'ensureSystemUser').rejects(new Error('an error'));

    try {
      const result = create_project_participants.ensureSystemUserAndProjectParticipantUser(
        1,
        { userIdentifier: 'jsmith', identitySource: 'IDIR', roleId: 1, userGuid: null },
        dbConnectionObj
      );
      await result;
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should catch and re-throw an error thrown by addProjectRole', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: null
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(UserService.prototype, 'ensureSystemUser').resolves({ id: 1 } as any);
    sinon.stub(ProjectService.prototype, 'ensureProjectParticipant').rejects(new Error('an error'));

    try {
      const result = create_project_participants.ensureSystemUserAndProjectParticipantUser(
        1,
        { userIdentifier: 'jsmith', identitySource: 'IDIR', roleId: 1, userGuid: null },
        dbConnectionObj
      );
      await result;
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should return successfully when no errors are thrown', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: null
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(UserService.prototype, 'ensureSystemUser').resolves({ id: 1 } as any);
    sinon.stub(ProjectService.prototype, 'ensureProjectParticipant').resolves();

    const result = create_project_participants.ensureSystemUserAndProjectParticipantUser(
      1,
      { userIdentifier: 'jsmith', identitySource: 'IDIR', roleId: 1, userGuid: null },
      dbConnectionObj
    );
    await result;
  });
});
