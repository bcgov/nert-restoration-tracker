import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { DraftRepository, ICreateDraftResponse } from '../../repositories/draft-repository';
import * as draft from './index';

chai.use(sinonChai);

describe('draft', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      id: 1,
      name: 'name',
      data: {}
    }
  } as any;

  let actualResult = {
    id: null,
    date: null
  };

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  describe('createDraft', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no id in result', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(DraftRepository.prototype, 'createDraft').resolves(undefined);

      try {
        const result = draft.createDraft();

        await result(sampleReq, sampleRes as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to save draft');
      }
    });

    it('should return the draft id and update date on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon
        .stub(DraftRepository.prototype, 'createDraft')
        .resolves({ id: 1, update_date: '2020/05/05' } as ICreateDraftResponse);

      const result = draft.createDraft();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult.id).to.equal(1);
      expect(actualResult.date).to.equal('2020/05/05');
    });

    it('should return the draft id and create date on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon
        .stub(DraftRepository.prototype, 'createDraft')
        .resolves({ id: 1, create_date: '2020/04/04' } as ICreateDraftResponse);

      const result = draft.createDraft();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult.id).to.equal(1);
      expect(actualResult.date).to.equal('2020/04/04');
    });

    it('should throw an error when a failure occurs', async () => {
      const expectedError = new Error('cannot process query');

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(DraftRepository.prototype, 'createDraft').throws(expectedError);

      try {
        const result = draft.createDraft();

        await result(sampleReq, null as unknown as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });
  });

  describe('updateDraft', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when missing request body param id', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      try {
        const result = draft.updateDraft();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, id: null } },
          null as unknown as any,
          null as unknown as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required param id');
      }
    });

    it('should throw a 400 error when missing request body param name', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      try {
        const result = draft.updateDraft();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, name: null } },
          null as unknown as any,
          null as unknown as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required param name');
      }
    });

    it('should throw a 400 error when missing request body param data', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      try {
        const result = draft.updateDraft();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, data: null } },
          null as unknown as any,
          null as unknown as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required param data');
      }
    });

    it('should throw a 400 error when no id in result', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(DraftRepository.prototype, 'updateDraft').resolves(undefined);

      try {
        const result = draft.updateDraft();

        await result(sampleReq, sampleRes as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to update draft');
      }
    });

    it('should return the draft id and update date on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon
        .stub(DraftRepository.prototype, 'updateDraft')
        .resolves({ id: 1, update_date: '2020/05/05' } as ICreateDraftResponse);

      const result = draft.updateDraft();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult.id).to.equal(1);
      expect(actualResult.date).to.equal('2020/05/05');
    });

    it('should return the draft id and create date on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon
        .stub(DraftRepository.prototype, 'updateDraft')
        .resolves({ id: 1, create_date: '2020/05/05' } as ICreateDraftResponse);

      const result = draft.updateDraft();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult.id).to.equal(1);
      expect(actualResult.date).to.equal('2020/05/05');
    });
  });

  describe('getDraftList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no system user id', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = draft.getDraftList();

        await result(sampleReq, null as unknown as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
      }
    });

    it('should throw a 400 error when no rows in result', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(DraftRepository.prototype, 'getDraftList').resolves(undefined);

      try {
        const result = draft.getDraftList();

        await result(sampleReq, sampleRes as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to get drafts');
      }
    });

    it('should return result on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(DraftRepository.prototype, 'getDraftList').resolves([{ id: 1, name: 'draft 1' }] as any);

      const result = draft.getDraftList();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult[0].id).to.equal(1);
      expect(actualResult[0].name).to.equal('draft 1');
    });
  });
});
