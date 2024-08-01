import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CodeRepository } from '../repositories/code-repository';
import { CodeService } from './code-service';

chai.use(sinonChai);

describe('CodeService', () => {
  describe('getAllCodeSets', function () {
    afterEach(() => {
      sinon.restore();
    });

    it.skip('returns all code sets', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(CodeRepository.prototype, 'getFirstNations').resolves([{ id: 1, name: 'codeName' }]);
      sinon.stub(CodeRepository.prototype, 'getSystemRoles').resolves([{ id: 1, name: 'codeName' }]);
      sinon.stub(CodeRepository.prototype, 'getProjectRoles').resolves([{ id: 1, name: 'codeName' }]);
      sinon
        .stub(CodeRepository.prototype, 'getAdministrativeActivityStatusType')
        .resolves([{ id: 1, name: 'codeName' }]);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'first_nations',
        'system_roles',
        'project_roles',
        'administrative_activity_status_type',
        'regions'
      );

      const queryReturn = [{ id: 1, name: 'codeName' }];

      expect(response.first_nations).to.eql(queryReturn);
      expect(response.system_roles).to.eql(queryReturn);
      expect(response.project_roles).to.eql(queryReturn);
      expect(response.administrative_activity_status_type).to.eql(queryReturn);
    });

    it('returns all empty code sets', async function () {
      const mockQuery = sinon.stub();
      mockQuery.resolves({});

      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      sinon.stub(CodeRepository.prototype, 'getFirstNations').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getSystemRoles').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getProjectRoles').resolves([]);
      sinon.stub(CodeRepository.prototype, 'getAdministrativeActivityStatusType').resolves([]);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'first_nations',
        'system_roles',
        'project_roles',
        'administrative_activity_status_type',
        'regions'
      );
      expect(response.first_nations).to.eql([]);
      expect(response.system_roles).to.eql([]);
      expect(response.project_roles).to.eql([]);
      expect(response.administrative_activity_status_type).to.eql([]);
    });
  });
});
