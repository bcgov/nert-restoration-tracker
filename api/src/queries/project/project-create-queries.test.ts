import { expect } from 'chai';
import { describe } from 'mocha';
import { PostCoordinatorData, PostFundingSource, PostLocationData, PostProjectData } from '../../models/project-create';
import {
  postProjectBoundarySQL,
  postProjectFundingSourceSQL,
  postProjectIndigenousNationSQL,
  postProjectIUCNSQL,
  postProjectSQL,
  postProjectStakeholderPartnershipSQL
} from './project-create-queries';

describe('postProjectSQL', () => {
  describe('Null project param provided', () => {
    it('returns null', () => {
      // force the function to accept a null value
      const response = postProjectSQL((null as unknown) as PostProjectData & PostLocationData & PostCoordinatorData);

      expect(response).to.be.null;
    });
  });

  describe('Valid project param provided', () => {
    const projectData = {
      name: 'name_test_data',
      objectives: 'objectives_test_data',
      start_date: 'start_date_test_data',
      end_date: 'end_date_test_data'
    };

    const coordinatorData = {
      first_name: 'coordinator_first_name',
      last_name: 'coordinator_last_name',
      email_address: 'coordinator_email_address@email.com',
      coordinator_agency: 'coordinator_agency_name',
      share_contact_details: false
    };

    const locationData = {
      location_description: 'a location description'
    };


    const postProjectData = new PostProjectData(projectData);
    const postCoordinatorData = new PostCoordinatorData(coordinatorData);

    it('returns a SQLStatement', () => {
      const postLocationData = new PostLocationData(locationData);
      const response = postProjectSQL({
        ...postProjectData,
        ...postCoordinatorData,
        ...postLocationData
      });

      expect(response).to.not.be.null;
    });
  });
});

describe('postProjectBoundarySQL', () => {
  describe('Null location data param provided', () => {
    it('returns null', () => {
      // force the function to accept a null value
      const response = postProjectBoundarySQL((null as unknown) as PostLocationData, 1);

      expect(response).to.be.null;
    });
  });

  describe('Null projectId param provided', () => {
    it('returns null', () => {
      const locationDataWithGeo = {
        geometry: [
          {
            type: 'Feature',
            id: 'myGeo',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-128, 55],
                  [-128, 55.5],
                  [-128, 56],
                  [-126, 58],
                  [-128, 55]
                ]
              ]
            },
            properties: {
              name: 'Restoration Islands'
            }
          }
        ]
      };

      const postLocationData = new PostLocationData(locationDataWithGeo);
      const response = postProjectBoundarySQL(postLocationData, (null as unknown) as number);

      expect(response).to.be.null;
    });
  });

  describe('Valid location data param provided', () => {
    it('returns a SQLStatement with a single geometry inserted correctly', () => {
      const locationDataWithGeo = {
        geometry: [
          {
            type: 'Feature',
            id: 'myGeo',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-128, 55],
                  [-128, 55.5],
                  [-128, 56],
                  [-126, 58],
                  [-128, 55]
                ]
              ]
            },
            properties: {
              name: 'Restoration Islands'
            }
          }
        ]
      };

      const postLocationData = new PostLocationData(locationDataWithGeo);
      const response = postProjectBoundarySQL(postLocationData, 1);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(
        '{"type":"Polygon","coordinates":[[[-128,55],[-128,55.5],[-128,56],[-126,58],[-128,55]]]}'
      );
    });

    it('returns a SQLStatement with multiple geometries inserted correctly', () => {
      const locationDataWithGeos = {
        geometry: [
          {
            type: 'Feature',
            id: 'myGeo1',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-128, 55],
                  [-128, 55.5],
                  [-128, 56],
                  [-126, 58],
                  [-128, 55]
                ]
              ]
            },
            properties: {
              name: 'Restoration Islands 1'
            }
          },
          {
            type: 'Feature',
            id: 'myGeo2',
            geometry: {
              type: 'Point',
              coordinates: [-128, 55]
            },
            properties: {
              name: 'Restoration Islands 2'
            }
          }
        ]
      };

      const postLocationData = new PostLocationData(locationDataWithGeos);
      const response = postProjectBoundarySQL(postLocationData, 1);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(
        '{"type":"Polygon","coordinates":[[[-128,55],[-128,55.5],[-128,56],[-126,58],[-128,55]]]}'
      );
      expect(response?.values).to.deep.include('{"type":"Point","coordinates":[-128,55]}');
    });
  });
});

describe('postProjectFundingSourceSQL', () => {
  describe('with invalid parameters', () => {
    it('returns null when funding source is null', () => {
      const response = postProjectFundingSourceSQL((null as unknown) as PostFundingSource, 1);

      expect(response).to.be.null;
    });

    it('returns null when project id is null', () => {
      const response = postProjectFundingSourceSQL(new PostFundingSource({}), (null as unknown) as number);

      expect(response).to.be.null;
    });
  });

  describe('with valid parameters', () => {
    it('returns a SQLStatement when all fields are passed in as expected', () => {
      const response = postProjectFundingSourceSQL(
        new PostFundingSource({
          agency_id: 111,
          investment_action_category: 222,
          agency_project_id: '123123123',
          funding_amount: 10000,
          start_date: '2020-02-02',
          end_date: '2020-03-02'
        }),
        333
      );

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(333);
      expect(response?.values).to.deep.include(222);
      expect(response?.values).to.deep.include('123123123');
      expect(response?.values).to.deep.include(10000);
      expect(response?.values).to.deep.include('2020-02-02');
      expect(response?.values).to.deep.include('2020-03-02');
    });
  });
});

describe('postProjectStakeholderPartnershipSQL', () => {
  it('Null indigenousNationId', () => {
    const response = postProjectStakeholderPartnershipSQL((null as unknown) as string, 1);
    expect(response).to.be.null;
  });

  it('Null projectId', () => {
    const response = postProjectStakeholderPartnershipSQL('123', (null as unknown) as number);
    expect(response).to.be.null;
  });

  it('null indigenousNationId and null projectId', () => {
    const response = postProjectStakeholderPartnershipSQL((null as unknown) as string, (null as unknown) as number);
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = postProjectStakeholderPartnershipSQL('123', 1);
    expect(response).to.not.be.null;
  });
});

describe('postProjectIndigenousNationSQL', () => {
  it('Null indigenousNationId', () => {
    const response = postProjectIndigenousNationSQL((null as unknown) as number, 1);
    expect(response).to.be.null;
  });

  it('Null projectId', () => {
    const response = postProjectIndigenousNationSQL(1, (null as unknown) as number);
    expect(response).to.be.null;
  });

  it('null indigenousNationId and null projectId', () => {
    const response = postProjectIndigenousNationSQL((null as unknown) as number, (null as unknown) as number);
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = postProjectIndigenousNationSQL(1, 1);
    expect(response).to.not.be.null;
  });
});

describe('postProjectIUCNSQL', () => {
  describe('with invalid parameters', () => {
    it('returns null when no iucn id', () => {
      const response = postProjectIUCNSQL((null as unknown) as number, 1);

      expect(response).to.be.null;
    });

    it('returns null when no project id', () => {
      const response = postProjectIUCNSQL(1, (null as unknown) as number);

      expect(response).to.be.null;
    });
  });

  describe('with valid parameters', () => {
    it('returns a SQLStatement when all fields are passed in as expected', () => {
      const response = postProjectIUCNSQL(1, 123);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(123);
    });
  });
});
