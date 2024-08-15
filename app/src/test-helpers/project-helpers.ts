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
        authorization_type: 'Permit type',
        authorization_desc: 'Description'
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
        phone_number: '123-456-7890',
        is_first_nation: true
      }
    ]
  },
  funding: {
    fundingSources: [
      {
        organization_name: 'name',
        investment_action_category: 1,
        description: 'description',
        funding_project_id: 'Agency123',
        start_date: '01/01/2020',
        end_date: '01/01/2021',
        funding_amount: 123,
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
