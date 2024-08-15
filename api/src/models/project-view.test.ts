import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetAuthorizationData,
  GetContactData,
  GetFundingData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetProjectData,
  GetSpeciesData
} from './project-view';

describe('GetPartnershipsData', () => {
  describe('No values provided', () => {
    let data: GetPartnershipsData;

    before(() => {
      data = new GetPartnershipsData(null as unknown as any[]);
    });

    it('sets partnerships', function () {
      expect(data.partnerships).to.eql([]);
    });
  });

  describe('Empty arrays as values provided', () => {
    let data: GetPartnershipsData;

    before(() => {
      data = new GetPartnershipsData([]);
    });

    it('sets partnerships', function () {
      expect(data.partnerships).to.eql([]);
    });
  });

  describe('partnerships values provided', () => {
    let data: GetPartnershipsData;

    const partnerships = [{ partnership: 'partner 1' }, { partnership: 'partner 2' }];

    before(() => {
      data = new GetPartnershipsData(partnerships);
    });

    it('sets partnerships', function () {
      expect(data.partnerships).to.eql([{ partnership: 'partner 1' }, { partnership: 'partner 2' }]);
    });
  });

  describe('All values provided', () => {
    let data: GetPartnershipsData;

    const partnerships = [{ partnership: 'partner 3' }, { partnership: 'partner 4' }];

    before(() => {
      data = new GetPartnershipsData(partnerships);
    });

    it('sets partnerships', function () {
      expect(data.partnerships).to.eql([{ partnership: 'partner 3' }, { partnership: 'partner 4' }]);
    });
  });
});

describe('GetObjectivesData', () => {
  describe('No values provided', () => {
    let data: GetObjectivesData;

    before(() => {
      data = new GetObjectivesData(null as unknown as any[]);
    });

    it('sets objectives', function () {
      expect(data.objectives).to.eql([]);
    });
  });

  describe('Empty arrays as values provided', () => {
    let data: GetObjectivesData;

    before(() => {
      data = new GetObjectivesData([]);
    });

    it('sets objectives', function () {
      expect(data.objectives).to.eql([]);
    });
  });

  describe('objectives values provided', () => {
    let data: GetObjectivesData;

    const objectives = [{ objective: 'objective 1' }, { objective: 'objective 2' }];

    before(() => {
      data = new GetObjectivesData(objectives);
    });

    it('sets objectives', function () {
      expect(data.objectives).to.eql([{ objective: 'objective 1' }, { objective: 'objective 2' }]);
    });
  });

  describe('All values provided', () => {
    let data: GetObjectivesData;

    const objectives = [{ objective: 'objective 3' }, { objective: 'objective 4' }];

    before(() => {
      data = new GetObjectivesData(objectives);
    });

    it('sets objectives', function () {
      expect(data.objectives).to.eql([{ objective: 'objective 3' }, { objective: 'objective 4' }]);
    });
  });
});

describe('GetContactData', () => {
  describe('No values provided', () => {
    let projectContactData: GetContactData;

    before(() => {
      projectContactData = new GetContactData(null as unknown as any[]);
    });

    it('sets contacts', function () {
      expect(projectContactData.contacts).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectContactData: GetContactData;

    const contacts = [
      {
        first_name: 'first',
        last_name: 'last',
        email_address: 'email@example.com',
        is_public: 'Y',
        is_primary: 'Y',
        is_first_nation: true,
        organization: 'organization',
        phone_number: '123-456-7890'
      }
    ];

    before(() => {
      projectContactData = new GetContactData(contacts);
    });

    it('sets permits', function () {
      expect(projectContactData.contacts).to.eql([
        {
          first_name: 'first',
          last_name: 'last',
          email_address: 'email@example.com',
          is_public: 'true',
          is_primary: 'true',
          is_first_nation: true,
          organization: 'organization',
          phone_number: '123-456-7890'
        }
      ]);
    });
  });
});

describe('GetSpeciesData', () => {
  describe('No values provided', () => {
    let data: GetSpeciesData;

    const obj: any[] = [];

    before(() => {
      data = new GetSpeciesData(obj);
    });

    it('sets focal species', function () {
      expect(data.focal_species).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetSpeciesData;

    const obj = [
      {
        itis_tsn: 1
      },
      {
        itis_tsn: 2
      }
    ];

    before(() => {
      data = new GetSpeciesData(obj);
    });

    it('sets focal species', function () {
      expect(data.focal_species).to.eql([1, 2]);
    });
  });
});

describe('GetLocationData', () => {
  describe('No values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData();
    });

    it('sets geometry, region', function () {
      expect(locationData.geometry).to.eql([]);
      expect(locationData.region).to.eql(null);
    });
  });

  describe('Empty array values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData([], []);
    });

    it('sets geometry, region', function () {
      expect(locationData.geometry).to.eql([]);
      expect(locationData.region).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let locationData: GetLocationData;

    const geometry = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [125.6, 10.1]
        },
        properties: {
          name: 'Dinagat Islands'
        }
      }
    ];

    const locationDataObj = [
      {
        geojson: geometry
      },
      {
        geojson: []
      }
    ];

    const regionDataObj = [
      {
        objectid: 1
      },
      {
        objectid: []
      }
    ];

    before(() => {
      locationData = new GetLocationData(locationDataObj, regionDataObj);
    });

    it('sets the geometry, region', function () {
      expect(locationData.geometry).to.eql(geometry);
      expect(locationData.region).to.eql(1);
    });
  });
});

describe('GetProjectData', () => {
  describe('No values provided', () => {
    let data: GetProjectData;

    before(() => {
      data = new GetProjectData();
    });

    it('sets name', () => {
      expect(data.project_name).to.equal('');
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const projectData = {
      name: 'project name',
      type: 4,
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1
    };

    let data: GetProjectData;

    before(() => {
      data = new GetProjectData(projectData);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal(projectData.name);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('2020-04-20T07:00:00.000Z');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020-05-20T07:00:00.000Z');
    });
  });
});

describe('GetAuthorizationData', () => {
  describe('No values provided', () => {
    let projectPermitData: GetAuthorizationData;

    before(() => {
      projectPermitData = new GetAuthorizationData(null as unknown as any[]);
    });

    it('sets authorizations', function () {
      expect(projectPermitData.authorizations).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectPermitData: GetAuthorizationData;

    const authorizations = [
      {
        number: '1',
        type: 'permit type',
        description: 'description'
      }
    ];

    before(() => {
      projectPermitData = new GetAuthorizationData(authorizations);
    });

    it('sets authorizations', function () {
      expect(projectPermitData.authorizations).to.eql([
        {
          authorization_ref: '1',
          authorization_type: 'permit type',
          authorization_desc: 'description'
        }
      ]);
    });
  });
});

describe('GetFundingData', () => {
  describe('No values provided', () => {
    let fundingData: GetFundingData;

    before(() => {
      fundingData = new GetFundingData(null as unknown as any[]);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql([]);
    });
  });

  describe('No length for funding data provided', () => {
    let fundingData: GetFundingData;

    before(() => {
      fundingData = new GetFundingData([]);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let fundingData: GetFundingData;

    const fundingDataObj = [
      {
        organization_name: 'name',
        description: 'description',
        funding_project_id: 'Agency123',
        funding_amount: 123,
        start_date: '01/01/2020',
        end_date: '01/01/2021',
        is_public: 'false'
      }
    ];

    before(() => {
      fundingData = new GetFundingData(fundingDataObj);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql(fundingDataObj);
    });
  });
});
