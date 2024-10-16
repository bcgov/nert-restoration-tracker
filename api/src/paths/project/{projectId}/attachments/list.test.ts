import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { GetAttachmentsData } from '../../../../models/project-attachments';
import { AttachmentService } from '../../../../services/attachment-service';
import { getAttachments } from './list';

chai.use(sinonChai);

describe('getAttachments', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      await getAttachments()(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should return a list of project attachments, on success', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(AttachmentService.prototype, 'getAttachmentsByType').resolves(new GetAttachmentsData());

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    const requestHandler = getAttachments();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({ attachmentsList: [] });
    expect(mockRes.statusValue).to.equal(200);
  });

  it('should throw an error when list attachments fails', async () => {
    const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(AttachmentService.prototype, 'getAttachmentsByType').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1'
    };

    try {
      const requestHandler = getAttachments();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.rollback).to.have.been.called;
      expect(dbConnectionObj.release).to.have.been.called;
      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
