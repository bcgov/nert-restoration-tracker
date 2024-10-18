import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { SYSTEM_ROLE } from '../constants/roles';
import * as db from '../database/db';
import { AuthorizationService } from '../services/authorization-service';
import { ProjectService } from '../services/project-service';
import * as search from './search';

chai.use(sinonChai);

describe('search', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    system_user: {
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  describe('getSearchResults', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('catches and rethrows errors', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        sinon.stub(ProjectService.prototype, 'getSpatialSearch').rejects(new Error('An error occurred'));

        const result = search.getSearchResults();

        await result(sampleReq, sampleRes as any, null as unknown as any);

        expect.fail();
      } catch (actualError: any) {
        expect(actualError.message).to.equal('An error occurred');
      }
    });

    it('should return null when no response returned from getSpatialSearch', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: null });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });
      sinon.stub(AuthorizationService, 'userHasValidRole').returns(true);
      sinon.stub(ProjectService.prototype, 'getSpatialSearch').resolves(undefined);

      const result = search.getSearchResults();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult).to.equal(null);
    });

    it('should return rows on success when result is empty', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: [] });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });
      sinon.stub(AuthorizationService, 'userHasValidRole').returns(true);
      sinon.stub(ProjectService.prototype, 'getSpatialSearch').resolves([]);

      const result = search.getSearchResults();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult).to.eql([]);
    });

    it('should return rows on success', async () => {
      const searchList = [
        {
          id: 1,
          name: 'name',
          is_project: false,
          number_sites: 1,
          size_ha: 100,
          state_code: 1,
          maskedLocation: false,
          geometry: '{"type":"Point","coordinates":[50.7,60.9]}'
        }
      ];

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(AuthorizationService, 'userHasValidRole').returns(true);
      sinon.stub(ProjectService.prototype, 'getSpatialSearch').resolves(searchList);

      const result = search.getSearchResults();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult).to.eql([
        {
          id: searchList[0].id,
          name: searchList[0].name,
          is_project: false,
          number_sites: searchList[0].number_sites,
          size_ha: searchList[0].size_ha,
          state_code: searchList[0].state_code,
          maskedLocation: searchList[0].maskedLocation,
          geometry: [
            {
              type: 'Point',
              coordinates: [50.7, 60.9]
            }
          ]
        }
      ]);
    });
  });
});
