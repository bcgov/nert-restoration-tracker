import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetContactData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetPermitData,
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
      expect(data.partnerships).to.eql(['partner 1', 'partner 2']);
    });
  });

  describe('All values provided', () => {
    let data: GetPartnershipsData;

    const partnerships = [{ partnership: 'partner 3' }, { partnership: 'partner 4' }];

    before(() => {
      data = new GetPartnershipsData(partnerships);
    });

    it('sets partnerships', function () {
      expect(data.partnerships).to.eql(['partner 3', 'partner 4']);
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
      expect(data.objectives).to.eql(['objective 1', 'objective 2']);
    });
  });

  describe('All values provided', () => {
    let data: GetObjectivesData;

    const objectives = [{ objective: 'objective 3' }, { objective: 'objective 4' }];

    before(() => {
      data = new GetObjectivesData(objectives);
    });

    it('sets objectives', function () {
      expect(data.objectives).to.eql(['objective 3', 'objective 4']);
    });
  });
});

describe('GetIUCNClassificationData', () => {
  describe('No values provided', () => {
    it('sets classification details', function () {
      const iucnClassificationData = new GetIUCNClassificationData(null as unknown as any[]);

      expect(iucnClassificationData.classificationDetails).to.eql([]);
    });
  });

  describe('Empty array as values provided', () => {
    it('sets classification details', function () {
      const iucnClassificationData = new GetIUCNClassificationData([]);

      expect(iucnClassificationData.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    it('sets classification details', function () {
      const iucnClassificationDataObj = [
        {
          classification: 'class',
          subclassification1: 'subclass1',
          subclassification2: 'subclass2'
        }
      ];

      const iucnClassificationData = new GetIUCNClassificationData(iucnClassificationDataObj);

      expect(iucnClassificationData.classificationDetails).to.eql([
        {
          classification: 'class',
          subClassification1: 'subclass1',
          subClassification2: 'subclass2'
        }
      ]);
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
        agency: 'agency',
        is_public: 'Y',
        is_primary: 'Y'
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
          agency: 'agency',
          is_public: 'true',
          is_primary: 'true'
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

    it('sets focal species names', function () {
      expect(data.focal_species_names).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetSpeciesData;

    const obj = [
      {
        id: 1,
        label: 'english1'
      },
      {
        id: 2,
        label: 'english2'
      }
    ];

    before(() => {
      data = new GetSpeciesData(obj);
    });

    it('sets focal species', function () {
      expect(data.focal_species).to.eql([1, 2]);
    });

    it('sets focal species names', function () {
      expect(data.focal_species_names).to.eql(['english1', 'english2']);
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
      expect(locationData.region).to.eql('');
    });
  });

  describe('Empty array values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData([], []);
    });

    it('sets geometry, region', function () {
      expect(locationData.geometry).to.eql([]);
      expect(locationData.region).to.eql('');
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

describe('GetPermitData', () => {
  describe('No values provided', () => {
    let projectPermitData: GetPermitData;

    before(() => {
      projectPermitData = new GetPermitData(null as unknown as any[]);
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectPermitData: GetPermitData;

    const permits = [
      {
        number: '1',
        type: 'permit type'
      }
    ];

    before(() => {
      projectPermitData = new GetPermitData(permits);
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([
        {
          permit_number: '1',
          permit_type: 'permit type'
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
        id: 1,
        agency_id: '1',
        agency_name: 'Agency name',
        agency_project_id: 'Agency123',
        investment_action_category: 'Investment',
        investment_action_category_name: 'Investment name',
        start_date: '01/01/2020',
        end_date: '01/01/2021',
        funding_amount: 123,
        revision_count: 0
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
