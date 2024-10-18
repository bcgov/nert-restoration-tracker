import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CodeRepository, CodeType } from '../repositories/code-repository';
import { CodeService } from './code-service';

chai.use(sinonChai);

describe('CodeService', () => {
  describe('getAllCodeSets', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns all code sets', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(CodeRepository.prototype, 'getFirstNations').resolves([{ id: 1, name: 'codeName' }]);
      sinon.stub(CodeRepository.prototype, 'getSystemRoles').resolves([{ id: 1, name: 'codeName' }]);
      sinon.stub(CodeRepository.prototype, 'getProjectRoles').resolves([{ id: 1, name: 'codeName' }]);
      sinon
        .stub(CodeRepository.prototype, 'getAdministrativeActivityStatusType')
        .resolves([{ id: 1, name: 'codeName' }]);
      sinon.stub(CodeRepository.prototype, 'getBranding').resolves([{ id: 1, name: 'codeName', value: 'codeValue' }]);
      sinon.stub(CodeRepository.prototype, 'getAuthorizationType').resolves([{ id: 1, name: 'codeName' }]);
      sinon.stub(CodeRepository.prototype, 'getPartnershipType').resolves([{ id: 1, name: 'codeName' }]);
      sinon.stub(CodeRepository.prototype, 'getPartnerships').resolves([{ id: 1, name: 'codeName' }]);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'first_nations',
        'system_roles',
        'project_roles',
        'administrative_activity_status_type',
        'regions',
        'branding',
        'authorization_type',
        'partnership_type',
        'partnerships'
      );

      const queryReturn = [{ id: 1, name: 'codeName' }];

      expect(response.first_nations).to.eql(queryReturn);
      expect(response.system_roles).to.eql(queryReturn);
      expect(response.project_roles).to.eql(queryReturn);
      expect(response.administrative_activity_status_type).to.eql(queryReturn);
      expect(response.branding).to.eql([{ id: 1, name: 'codeName', value: 'codeValue' }]);
      expect(response.authorization_type).to.eql(queryReturn);
      expect(response.partnership_type).to.eql(queryReturn);
      expect(response.partnerships).to.eql(queryReturn);
    });

    it('returns all empty code sets', async function () {
      const mockQuery = sinon.stub();
      mockQuery.resolves({});

      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      sinon.stub(CodeRepository.prototype, 'getFirstNations').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getSystemRoles').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getProjectRoles').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getAdministrativeActivityStatusType').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getBranding').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getAuthorizationType').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getPartnershipType').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getPartnerships').resolves([]);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'first_nations',
        'system_roles',
        'project_roles',
        'administrative_activity_status_type',
        'regions',
        'branding',
        'authorization_type',
        'partnership_type',
        'partnerships'
      );
      expect(response.first_nations).to.eql([]);
      expect(response.system_roles).to.eql([]);
      expect(response.project_roles).to.eql([]);
      expect(response.administrative_activity_status_type).to.eql([]);
      expect(response.branding).to.eql([]);
      expect(response.authorization_type).to.eql([]);
      expect(response.partnership_type).to.eql([]);
      expect(response.partnerships).to.eql([]);
    });
  });

  describe('updateCode', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns the updated code', async function () {
      const mockDBConnection = getMockDBConnection();

      const updateBrandingStub = sinon
        .stub(CodeRepository.prototype, 'updateBranding')
        .resolves({ id: 1, name: 'codeName' });

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.updateCode(CodeType.BRANDING, { id: 1, name: 'codeName', value: 'codeValue' });

      expect(response).to.eql({ id: 1, name: 'codeName' });
      expect(updateBrandingStub).to.have.been.calledWith('codeName', 'codeValue', 1);
    });

    it('throws an error when the code type is not found', async function () {
      const mockDBConnection = getMockDBConnection();

      const codeService = new CodeService(mockDBConnection);

      try {
        await codeService.updateCode('invalid' as CodeType, { id: 1, name: 'codeName' });
      } catch (error: any) {
        expect(error.message).to.equal('Invalid code type: invalid');
      }
    });
  });
});
