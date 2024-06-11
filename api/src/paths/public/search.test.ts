import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import * as db from '../../database/db';
import * as search from './search';

chai.use(sinonChai);

describe('search', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
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

    it('should return null when no response returned from getPublicSpatialSearchResultsSQL', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: null });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });

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
          geometry: '{"type":"Point","coordinates":[50.7,60.9]}'
        }
      ];

      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: searchList });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });

      const result = search.getSearchResults();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult).to.eql([
        {
          id: searchList[0].id,
          is_project: false,
          name: searchList[0].name,
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
