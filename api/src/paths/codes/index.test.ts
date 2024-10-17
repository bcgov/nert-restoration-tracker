import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { CodeService } from '../../services/code-service';
import * as codes from './index';

chai.use(sinonChai);

describe('codes', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      codeType: 'first_nations',
      codeData: {
        id: 1,
        name: 'management action',
        value: 'management action',
        fs_id: 1
      }
    }
  } as any;

  let actualResult = {
    management_action_type: null
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

  describe('getAllCodes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 500 error when fails to fetch codes', async () => {
      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);
      sinon.stub(CodeService.prototype, 'getAllCodeSets').resolves(undefined);

      try {
        const result = codes.getAllCodes();

        await result(sampleReq, null as unknown as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(500);
        expect((actualError as HTTPError).message).to.equal('Failed to fetch codes');
      }
    });

    it('should return the fetched codes on success', async () => {
      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);
      sinon.stub(CodeService.prototype, 'getAllCodeSets').resolves({
        management_action_type: { id: 1, name: 'management action type' }
      } as any);

      const result = codes.getAllCodes();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult.management_action_type).to.eql({ id: 1, name: 'management action type' });
    });

    it('should throw an error when a failure occurs', async () => {
      const expectedError = new Error('cannot process request');

      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);
      sinon.stub(CodeService.prototype, 'getAllCodeSets').rejects(expectedError);

      try {
        const result = codes.getAllCodes();

        await result(sampleReq, sampleRes as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });
  });

  describe('updateCode', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 500 error when fails to update code', async () => {
      const dbConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnection);
      sinon.stub(CodeService.prototype, 'updateCode').resolves(null);

      try {
        const result = codes.updateCode();

        await result(sampleReq, null as unknown as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to update code');
      }
    });

    it('should return the updated code on success', async () => {
      const dbConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnection);

      sinon.stub(CodeService.prototype, 'updateCode').resolves({
        id: 1,
        name: 'management action type'
      } as any);

      const result = codes.updateCode();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult).to.eql({ success: true });
    });
  });
});
