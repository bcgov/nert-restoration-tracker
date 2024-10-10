import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../../__mocks__/db';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { DraftRepository } from '../../../../repositories/draft-repository';
import * as file_utils from '../../../../utils/file-utils';
import * as upload from './upload';

chai.use(sinonChai);

describe('uploadMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      draftId: 1,
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
    body: {
      media: 'test.txt',
      fileType: 'draft'
    }
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

  it('should throw an error when draftId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadDraftAttachment();

      await result(
        { ...mockReq, params: { ...mockReq.params, draftId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing draftId');
    }
  });

  it('should throw an error when files are missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadDraftAttachment();

      await result({ ...mockReq, files: [] }, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing upload data');
    }
  });

  it('should throw an error when body is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadDraftAttachment();

      await result({ ...mockReq, body: null }, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing request body');
    }
  });

  it('should throw a 400 error when file contains malicious content', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    try {
      const result = upload.uploadDraftAttachment();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Malicious content detected, upload cancelled');
    }
  });

  it('should return id and revision_count on success (with username and email) with valid parameters', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon
      .stub(DraftRepository.prototype, 'getDraft')
      .resolves({ id: 1, is_project: false, name: 'Name', data: { project: {} } });
    sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
    sinon.stub(DraftRepository.prototype, 'updateDraft').resolves({
      id: 1,
      is_project: false,
      name: 'Name',
      update_date: '2021-08-31T00:00:00.000Z',
      create_date: '2021-08-31T00:00:00.000Z'
    });

    const result = upload.uploadDraftAttachment();

    await result(mockReq, mockRes as any, null as unknown as any);

    expect(actualResult).to.eql(undefined);
  });

  it('catches and returns a 500 error', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon
      .stub(DraftRepository.prototype, 'getDraft')
      .resolves({ id: 1, is_project: false, name: 'Name', data: { project: {} } });
    sinon.stub(file_utils, 'uploadFileToS3').throws(new Error('An error occurred'));

    try {
      const result = upload.uploadDraftAttachment();

      await result(mockReq, mockRes as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('An error occurred');
    }
  });
});
