import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

//TODO: Update project object
export const getProjectForViewResponse: IGetProjectForViewResponse = {
  project: {
    project_id: 1,
    project_name: 'Test Project Name',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    publish_date: '2021-01-26',
    region: 'NRM Region 1',
    state_code: 1,
    is_project: true,
    actual_start_date: '',
    actual_end_date: '',
    brief_desc: 'desc',
    is_healing_land: true,
    is_healing_people: true,
    is_land_initiative: true,
    is_cultural_initiative: true,
    people_involved: 12,
    is_project_part_public_plan: true
  },
  species: {
    focal_species: [1234, 4321]
  },
  authorization: {
    authorizations: [
      {
        authorization_ref: '123',
        authorization_type: 'Permit type'
      }
    ]
  },
  location: {
    geometry: [],
    region: 1234,
    is_within_overlapping: 'true',
    number_sites: 1,
    size_ha: 1,
    conservationAreas: []
  },
  contact: {
    contacts: [
      {
        first_name: 'Amanda',
        last_name: 'Christensen',
        email_address: 'amanda@christensen.com',
        organization: 'Amanda and associates',
        is_public: 'true',
        is_primary: 'true',
        phone_number: '123-456-7890'
      }
    ]
  },
  iucn: {
    classificationDetails: [
      {
        classification: 1,
        subClassification1: 1,
        subClassification2: 1
      }
    ]
  },
  funding: {
    fundingSources: [
      {
        agency_id: 1,
        agency_project_id: 'ABC123',
        investment_action_category: 1,
        funding_amount: 333,
        start_date: '2000-04-14',
        end_date: '2021-04-13',
        description: '',
        is_public: 'true'
      }
    ]
  },
  partnership: {
    partnerships: [{ partnership: 'partner2' }, { partnership: 'partner3' }]
  },
  objective: {
    objectives: [{ objective: 'objective2' }, { objective: 'objective3' }]
  }
};
