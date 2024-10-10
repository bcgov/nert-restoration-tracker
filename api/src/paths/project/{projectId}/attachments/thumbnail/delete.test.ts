import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { AttachmentService } from '../../../../../services/attachment-service';
import * as deleteThumb from './delete';

chai.use(sinonChai);

describe('deleteThumbnail', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      projectId: 1
    },
    body: {}
  } as any;

  let actualResult: any = null;

  const mockRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  } as any;

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = deleteThumb.deleteThumbnail();

      await result(
        { ...mockReq, params: { ...mockReq.params, projectId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should return a 200 response', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(AttachmentService.prototype, 'getAttachmentsByType')
      .resolves({ attachmentsList: [{ id: 1, fileName: 'name', lastModified: 'mod', size: 11, url: 'url' }] });

    const deleteAttachmentStub = sinon.stub(AttachmentService.prototype, 'deleteAttachment').resolves();

    const result = deleteThumb.deleteThumbnail();

    await result(mockReq, mockRes as any, null as unknown as any);
    expect(actualResult).to.eql(undefined);
    expect(deleteAttachmentStub).to.have.been.calledOnce;
  });

  it('catches and returns a 500 error', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(AttachmentService.prototype, 'getAttachmentsByType')
      .resolves({ attachmentsList: [{ id: 1, fileName: 'name', lastModified: 'mod', size: 11, url: 'url' }] });

    const deleteAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'deleteAttachment')
      .throws(new Error('An error occurred'));

    try {
      const result = deleteThumb.deleteThumbnail();

      await result(mockReq, mockRes as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect(deleteAttachmentStub).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('An error occurred');
    }
  });
});
