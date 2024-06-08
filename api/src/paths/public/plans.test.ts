import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import * as db from '../../database/db';
import { PlanService } from '../../services/plan-service';
import { SearchService } from '../../services/search-service';
import * as plans from './plans';

chai.use(sinonChai);

describe('getPublicPlansList', () => {
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

  it('catches errors and returns 500 status', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(SearchService.prototype, 'findProjectIdsByCriteria').throws(new Error('Test error'));

    try {
      const result = plans.getPublicPlansList();
      await result(sampleReq, sampleRes as any, null as unknown as any);
    } catch (actualError) {
      expect((actualError as Error).message).to.equal('Test error');
    }
  });

  it('should return all public plans on success', async () => {
    const plansList = [
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
    sinon.stub(PlanService.prototype, 'getPlansByIds').resolves(plansList as any);

    const result = plans.getPublicPlansList();

    await result(sampleReq, sampleRes as any, null as unknown as any);

    expect(actualResult).to.eql([
      {
        id: plansList[0].id,
        name: plansList[0].name,
        start_date: plansList[0].start_date,
        end_date: plansList[0].end_date,
        agency_list: plansList[0].agency_list,
        permits_list: plansList[0].permits_list
      }
    ]);
  });
});
