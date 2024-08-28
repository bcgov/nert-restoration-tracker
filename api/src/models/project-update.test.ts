import { expect } from 'chai';
import { describe } from 'mocha';
import { PutProjectData, PutProjectObject } from './project-update';

describe('PutProjectObject', () => {
  it('should create an instance', () => {
    expect(new PutProjectObject()).to.be.instanceOf(PutProjectObject);
  });

  it('should create an instance with data', () => {
    const data = {
      contact: {},
      species: { focal_species: [] },
      authorization: {},
      project: {},
      location: {},
      funding: {},
      partnership: {},
      objective: {},
      focus: { focuses: [] },
      restoration_plan: {}
    };
    expect(new PutProjectObject(data)).to.be.instanceOf(PutProjectObject);
  });

  it('should create an instance with null data', () => {
    const data = {
      contact: null,
      species: null,
      authorization: null,
      project: null,
      location: null,
      funding: null,
      partnership: null,
      objective: null,
      focus: null,
      restoration_plan: null
    };
    expect(new PutProjectObject(data)).to.be.instanceOf(PutProjectObject);
  });
});

describe('PutProjectData', () => {
  it('should create an instance', () => {
    expect(new PutProjectData()).to.be.instanceOf(PutProjectData);
  });

  it('should create an instance with data', () => {
    const data = {
      is_project: false,
      name: 'string',
      state_code: 1,
      start_date: 'string',
      end_date: 'string',
      actual_start_date: 'string',
      actual_end_date: 'string',
      brief_desc: 'string',
      is_healing_land: false,
      is_healing_people: false,
      is_land_initiative: false,
      is_cultural_initiative: false,
      people_involved: 1,
      is_project_part_public_plan: false
    };
    expect(new PutProjectData(data)).to.be.instanceOf(PutProjectData);
  });

  it('should create an instance with null data', () => {
    const data = {
      is_project: null,
      name: null,
      state_code: null,
      start_date: null,
      end_date: null,
      actual_start_date: null,
      actual_end_date: null,
      brief_desc: null,
      is_healing_land: null,
      is_healing_people: null,
      is_land_initiative: null,
      is_cultural_initiative: null,
      people_involved: null,
      is_project_part_public_plan: null
    };
    expect(new PutProjectData(data)).to.be.instanceOf(PutProjectData);
  });
});
