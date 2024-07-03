import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PostContactData,
  PostFundingData,
  PostFundingSource,
  PostIUCNData,
  PostLocationData,
  PostObjectivesData,
  PostPartnershipsData,
  PostProjectData,
  PostProjectObject
} from './project-create';

describe('PostProjectObject', () => {
  describe('No values provided', () => {
    let projectPostObject: PostProjectObject;

    before(() => {
      projectPostObject = new PostProjectObject(null);
    });

    it('sets contact', function () {
      expect(projectPostObject.contact).to.equal(null);
    });

    it('sets project', function () {
      expect(projectPostObject.project).to.equal(null);
    });

    it('sets location', function () {
      expect(projectPostObject.location).to.equal(null);
    });

    it('sets iucn', function () {
      expect(projectPostObject.iucn).to.equal(null);
    });

    it('sets funding', function () {
      expect(projectPostObject.funding).to.equal(null);
    });

    it('sets partnerships', function () {
      expect(projectPostObject.partnership).to.eql([]);
    });

    it('sets objectives', function () {
      expect(projectPostObject.objective).to.eql([]);
    });
  });

  describe.skip('All values provided', () => {
    let projectPostObject: PostProjectObject;

    const obj = {
      contact: {
        contacts: [
          {
            first_name: 'first',
            last_name: 'last',
            email_address: 'email@example.com',
            organization: 'organization',
            is_public: 'true',
            is_primary: 'true'
          }
        ]
      },
      authorization: {
        authorizations: [
          {
            authorization_ref: 1
          }
        ]
      },
      project: {
        project_name: 'name_test_data',
        start_date: 'start_date_test_data',
        end_date: 'end_date_test_data',
        objectives: 'these are the project objectives',
        is_project: true,
        name: 'string;',
        state_code: 1,
        actual_start_date: 'string;',
        actual_end_date: 'string;',
        brief_desc: 'string;',
        is_healing_land: true,
        is_healing_people: true,
        is_land_initiative: true,
        is_cultural_initiative: true
      },
      location: {
        geometry: [
          {
            type: 'Polygon',
            coordinates: [
              [
                [-128, 55],
                [-128, 55.5],
                [-128, 56],
                [-126, 58],
                [-128, 55]
              ]
            ],
            properties: {
              name: 'Restoration Islands'
            }
          }
        ]
      },
      funding: {
        funding_sources: [
          {
            organization_name: 'name',
            funding_project_id: 'organization project id',
            funding_amount: 12,
            start_date: '2020/04/03',
            end_date: '2020/05/05'
          }
        ]
      },
      iucn: {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 2,
            subClassification2: 3
          }
        ]
      },
      partnerships: ['partner1, partner2'],
      objectives: ['objective1, obective2']
    };

    before(() => {
      projectPostObject = new PostProjectObject(obj);
    });

    it('sets contact', function () {
      expect(projectPostObject.contact.contacts[0].first_name).to.equal(obj.contact.contacts[0].first_name);
    });
  });
});

describe('PostProjectData', () => {
  describe('No values provided', () => {
    let projectPostData: PostProjectData;

    before(() => {
      projectPostData = new PostProjectData(null);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal(null);
    });

    it('sets start_date', function () {
      expect(projectPostData.start_date).to.equal(null);
    });

    it('sets end_date', function () {
      expect(projectPostData.end_date).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectPostData: PostProjectData;

    const obj = {
      project_name: 'name_test_data',
      start_date: 'start_date_test_data',
      end_date: 'end_date_test_data',
      objectives: 'project objectives'
    };

    before(() => {
      projectPostData = new PostProjectData(obj);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal('name_test_data');
    });

    it('sets start_date', function () {
      expect(projectPostData.start_date).to.equal('start_date_test_data');
    });

    it('sets end_date', function () {
      expect(projectPostData.end_date).to.equal('end_date_test_data');
    });
  });
});

describe('PostContactData', () => {
  describe('No values provided', () => {
    let projectContactData: PostContactData;

    before(() => {
      projectContactData = new PostContactData(null);
    });

    it('sets contacts', function () {
      expect(projectContactData.contacts).to.eql([]);
    });
  });

  describe('All values provided are null', () => {
    let projectContactData: PostContactData;

    before(() => {
      projectContactData = new PostContactData({
        contacts: null
      });
    });

    it('sets permits', function () {
      expect(projectContactData.contacts).to.eql([]);
    });
  });

  describe('All values provided are empty arrays', () => {
    let projectContactData: PostContactData;

    before(() => {
      projectContactData = new PostContactData({
        contacts: []
      });
    });

    it('sets permits', function () {
      expect(projectContactData.contacts).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectContactData: PostContactData;

    const obj = {
      contacts: [
        {
          first_name: 'first',
          last_name: 'last',
          email_address: 'email@example.com',
          organization: 'organization',
          phone_number: '1234567890',
          is_public: 'true',
          is_primary: 'true'
        }
      ]
    };

    before(() => {
      projectContactData = new PostContactData(obj);
    });

    it('sets contacts', function () {
      expect(projectContactData.contacts).to.eql([
        {
          first_name: 'first',
          last_name: 'last',
          email_address: 'email@example.com',
          organization: 'organization',
          phone_number: '1234567890',
          is_public: true,
          is_primary: true
        }
      ]);
    });
  });
});

describe('PostPartnershipsData', () => {
  describe('No values provided', () => {
    let projectPartnershipsData: PostPartnershipsData;

    before(() => {
      projectPartnershipsData = new PostPartnershipsData(null);
    });

    it('sets projectPartnershipsData', function () {
      expect(projectPartnershipsData.partnerships).to.eql([]);
    });
  });

  describe.skip('All values provided', () => {
    let projectPartnershipsData: PostPartnershipsData;

    const obj = ['1', '2'];

    before(() => {
      projectPartnershipsData = new PostPartnershipsData(obj);
    });

    it('sets projectPartnershipsData', function () {
      expect(projectPartnershipsData.partnerships).to.eql(obj);
    });
  });
});

describe('PostObjectivesData', () => {
  describe('No values provided', () => {
    let projectObjectiveData: PostObjectivesData;

    before(() => {
      projectObjectiveData = new PostObjectivesData(null);
    });

    it('sets projectObjectivesData', function () {
      expect(projectObjectiveData.objectives).to.eql([]);
    });
  });

  describe.skip('All values provided', () => {
    let projectObjectiveData: PostObjectivesData;

    const obj = ['1', '2'];

    before(() => {
      projectObjectiveData = new PostObjectivesData(obj);
    });

    it('sets projectObjectivesData', function () {
      expect(projectObjectiveData.objectives).to.eql(obj);
    });
  });
});

describe('PostFundingSource', () => {
  describe('No values provided', () => {
    let projectFundingData: PostFundingSource;

    before(() => {
      projectFundingData = new PostFundingSource(null);
    });

    it('sets organization_name', () => {
      expect(projectFundingData.organization_name).to.equal(null);
    });

    it('sets funding_project_id', () => {
      expect(projectFundingData.funding_project_id).to.equal(null);
    });

    it('sets funding_amount', () => {
      expect(projectFundingData.funding_amount).to.equal(null);
    });

    it('sets start_date', () => {
      expect(projectFundingData.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(projectFundingData.end_date).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectFundingData: PostFundingSource;

    const obj = {
      organization_name: 'name',
      funding_project_id: 'organization project id',
      funding_amount: 20,
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      description: 'description',
      is_public: 'true'
    };

    before(() => {
      projectFundingData = new PostFundingSource(obj);
    });

    it('sets organization_name', () => {
      expect(projectFundingData.organization_name).to.equal(obj.organization_name);
    });

    it('sets funding_project_id', () => {
      expect(projectFundingData.funding_project_id).to.equal(obj.funding_project_id);
    });

    it('sets funding_amount', () => {
      expect(projectFundingData.funding_amount).to.equal(obj.funding_amount);
    });

    it('sets start_date', () => {
      expect(projectFundingData.start_date).to.equal(obj.start_date);
    });

    it('sets end_date', () => {
      expect(projectFundingData.end_date).to.equal(obj.end_date);
    });
  });
});

describe('PostIUCNData', () => {
  describe('No values provided', () => {
    let projectIUCNData: PostIUCNData;

    before(() => {
      projectIUCNData = new PostIUCNData(null);
    });

    it('sets classification details', function () {
      expect(projectIUCNData.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectIUCNData: PostIUCNData;

    const obj = {
      classificationDetails: [
        {
          classification: 1,
          subClassification1: 2,
          subClassification2: 3
        }
      ]
    };

    before(() => {
      projectIUCNData = new PostIUCNData(obj);
    });

    it('sets classification details', function () {
      expect(projectIUCNData.classificationDetails).to.eql(obj.classificationDetails);
    });
  });
});

describe('PostLocationData', () => {
  describe('No values provided', () => {
    let projectLocationData: PostLocationData;

    before(() => {
      projectLocationData = new PostLocationData(null);
    });

    it('sets geometry', function () {
      expect(projectLocationData.geometry).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectLocationData: PostLocationData;

    const obj = {
      geometry: [
        {
          type: 'Polygon',
          coordinates: [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ],
          properties: {
            name: 'Restoration Islands'
          }
        }
      ]
    };

    before(() => {
      projectLocationData = new PostLocationData(obj);
    });

    it('sets the geometry', function () {
      expect(projectLocationData.geometry).to.eql(obj.geometry);
    });
  });
});

describe('PostFundingData', () => {
  describe('No values provided', () => {
    let data: PostFundingData;

    before(() => {
      data = new PostFundingData(null);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('Values provided but not valid arrays', () => {
    let data: PostFundingData;

    const obj = {
      fundingSources: null
    };

    before(() => {
      data = new PostFundingData(obj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('Values provided but with no length', () => {
    let data: PostFundingData;

    const obj = {
      fundingSources: []
    };

    before(() => {
      data = new PostFundingData(obj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PostFundingData;

    const obj = {
      fundingSources: [
        {
          organization_name: 'name',
          description: 'description',
          funding_project_id: 'Agency123',
          start_date: '01/01/2020',
          end_date: '01/01/2021',
          funding_amount: 123,
          is_public: 'false'
        }
      ]
    };

    const objReturn = {
      fundingSources: [
        {
          organization_name: 'name',
          description: 'description',
          funding_project_id: 'Agency123',
          start_date: '01/01/2020',
          end_date: '01/01/2021',
          funding_amount: 123,
          is_public: false
        }
      ]
    };

    before(() => {
      data = new PostFundingData(obj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql(objReturn.fundingSources);
    });
  });
});
