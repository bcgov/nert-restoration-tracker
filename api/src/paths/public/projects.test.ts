import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import * as db from '../../database/db';
import { ProjectService } from '../../services/project-service';
import { SearchService } from '../../services/search-service';
import * as projects from './projects';

chai.use(sinonChai);

describe('getPublicProjectsPlansList', () => {
  afterEach(() => {
    sinon.restore();
  });

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

  it.skip('should return all public projects on success', async () => {
    const projectsList = [
      {
        id: 1,
        name: 'name',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        agency_list: 'agency1, agency2',
        permits_list: '123, 1233'
      }
    ];

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(SearchService.prototype, 'findProjectIdsByCriteria').resolves([{ project_id: 1 }]);
    sinon.stub(ProjectService.prototype, 'getProjectsByIds').resolves(projectsList as any);

    const result = projects.getPublicProjectsPlansList();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql([
      {
        id: projectsList[0].id,
        name: projectsList[0].name,
        start_date: projectsList[0].start_date,
        end_date: projectsList[0].end_date,
        contact_agency_list: projectsList[0].agency_list,
        permits_list: projectsList[0].permits_list
      }
    ]);
  });
});
