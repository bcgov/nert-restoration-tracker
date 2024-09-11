export interface IProject {
  project: Project;
  species: Species;
  contact: IProjectContact;
  authorization: IProjectAuthorization;
  partnership: IProjectPartnership;
  objective: IProjectObjective;
  funding: Funding;
  location: Location;
}

export interface IProjectAuthorization {
  authorizations: AuthorizationElement[];
}

export interface AuthorizationElement {
  authorization_ref: string;
  authorization_type: string;
  authorization_desc: string;
}

export interface IProjectContact {
  contacts: ContactElement[];
}

export interface ContactElement {
  first_name: string;
  last_name: string;
  email_address: string;
  organization: string;
  phone_number: string;
  is_public: string;
  is_primary: string;
  is_first_nation: boolean;
}

export interface Funding {
  fundingSources: FundingSource[];
}

export interface FundingSource {
  organization_name: string;
  description: string;
  funding_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  is_public: string;
}

export interface Location {
  geometry: GeometryElement[];
  is_within_overlapping: string;
  region: number;
  number_sites: number;
  size_ha: number;
  conservationAreas: ConservationArea[];
}

export interface ConservationArea {
  conservationArea: string;
}

export interface GeometryElement {
  type: string;
  geometry: GeometryGeometry;
  properties: Properties;
}

export interface GeometryGeometry {
  type: string;
  coordinates: Array<Array<number[]>>;
}

export interface Properties {
  siteName: string;
}

export interface IProjectObjective {
  objectives: ObjectiveElement[];
}

export interface ObjectiveElement {
  objective: string;
}

export interface IProjectPartnership {
  partnerships: PartnershipElement[];
}

export interface PartnershipElement {
  partnership_type: string;
  partnership_ref: string;
  partnership_name: string;
}

export interface Project {
  project_id: number;
  is_project: boolean;
  uuid: string;
  project_name: string;
  state_code: number;
  start_date: string;
  end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  brief_desc: string;
  is_healing_land: boolean;
  is_healing_people: boolean;
  is_land_initiative: boolean;
  is_cultural_initiative: boolean;
  people_involved: number;
  is_project_part_public_plan: null;
  publish_date: null;
  revision_count: number;
}

export interface Species {
  focal_species: number[];
}

export const projectData: IProject = {
  project: {
    project_id: 1,
    is_project: true,
    uuid: "0f7b4f58-0b64-4f83-933c-83bbee63f397",
    project_name: "Seed Project 1",
    state_code: 1,
    start_date: "2003-09-15",
    end_date: "2028-09-09",
    actual_start_date: "2002-01-17",
    actual_end_date: "2027-11-07",
    brief_desc:
      "Aequitas.",
    is_healing_land: true,
    is_healing_people: true,
    is_land_initiative: true,
    is_cultural_initiative: true,
    people_involved: 10,
    is_project_part_public_plan: null,
    publish_date: null,
    revision_count: 12,
  },
  species: { focal_species: [180702] },
  contact: {
    contacts: [
      {
        first_name: "John",
        last_name: "Doe",
        email_address: "john@email.com",
        organization: "Ministry of Forests",
        phone_number: "250-555-5555",
        is_public: "true",
        is_primary: "true",
        is_first_nation: false,
      },
    ],
  },
  authorization: {
    authorizations: [
      {
        authorization_ref: "forest",
        authorization_type: "Forest Licence to Cut",
        authorization_desc: "forest cutting",
      },
    ],
  },
  partnership: {
    partnerships: [
      {
        partnership_type: "1",
        partnership_ref: "82",
        partnership_name: "asdf",
      },
      {
        partnership_type: "4",
        partnership_ref: "3",
        partnership_name: "",
      },
      {
        partnership_type: "5",
        partnership_ref: "",
        partnership_name: "asd",
      },
    ],
  },
  objective: {
    objectives: [
      {
        objective:
          "Turbo ultio.",
      },
    ],
  },
  funding: {
    fundingSources: [
      {
        organization_name: "kj funding",
        description: "kj",
        funding_project_id: "kj funding project id",
        funding_amount: 12345,
        start_date: "2024-09-01",
        end_date: "2024-09-27",
        is_public: "false",
      },
    ],
  },
  location: {
    geometry: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-121.904297, 50.930738],
              [-121.904297, 51.971346],
              [-120.19043, 51.971346],
              [-120.19043, 50.930738],
              [-121.904297, 50.930738],
            ],
          ],
        },
        properties: { siteName: "sdfg" },
      },
    ],
    is_within_overlapping: "Y",
    region: 3640,
    number_sites: 1,
    size_ha: 1377261.54,
    conservationAreas: [{ conservationArea: "convservation area" }],
  },
};
