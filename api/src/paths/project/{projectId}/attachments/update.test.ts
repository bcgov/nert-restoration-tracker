import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { AttachmentService } from '../../../../services/attachment-service';
import * as file_utils from '../../../../utils/file-utils';
import * as update from './update';

chai.use(sinonChai);

describe('updateAttachment', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      attachmentId: 2
    },
    files: [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ],
    body: {}
  } as any;

  // let actualResult: any = null;

  // const mockRes = {
  //   status: () => {
  //     return {
  //       json: (result: any) => {
  //         actualResult = result;
  //       }
  //     };
  //   }
  // } as any;

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = update.updateAttachment();

      await result(
        { ...mockReq, params: { ...mockReq.params, projectId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing projectId');
    }
  });

  it('should throw an error when body is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = update.updateAttachment();

      await result({ ...mockReq, body: null }, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing request body');
    }
  });

  it('should throw an error when s3File is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(file_utils, 'findFileInS3').resolves(undefined);

    try {
      const result = update.updateAttachment();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Error fetching file from S3');
    }
  });

  it('should return the expected result', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    const { mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(file_utils, 'findFileInS3').resolves({
      Metadata: { filename: 'test.txt' },
      ContentLength: 340
    });

    const insertProjectAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'insertProjectAttachment')
      .resolves({ id: 1 } as any);
    sinon.stub(file_utils, 'moveFileInS3').resolves();
    sinon.stub(dbConnectionObj, 'open').resolves();
    sinon.stub(dbConnectionObj, 'commit').resolves();
    sinon.stub(dbConnectionObj, 'release').returns();

    const result = update.updateAttachment();

    await result(mockReq, mockRes, mockNext);

    expect(insertProjectAttachmentStub).to.have.been.calledOnce;
  });

  it('should throw an error when an error occurs', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    const { mockRes, mockNext } = getRequestHandlerMocks();
    sinon.stub(file_utils, 'findFileInS3').resolves({
      Metadata: { filename: 'test.txt' },
      ContentLength: 340
    });

    sinon.stub(AttachmentService.prototype, 'insertProjectAttachment').rejects(new Error('a test error'));

    try {
      const result = update.updateAttachment();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError: any) {
      expect(actualError.message).to.eql('a test error');
    }
  });
});
