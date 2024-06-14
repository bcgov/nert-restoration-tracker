import { Feature } from 'geojson';
import { IPostIUCN, PostFundingSource } from './project-create';

export class PutIUCNData {
  classificationDetails: IPostIUCN[];

  constructor(obj?: any) {
    this.classificationDetails =
      (obj?.classificationDetails?.length &&
        obj.classificationDetails.map((item: any) => {
          return {
            classification: item.classification,
            subClassification1: item.subClassification1,
            subClassification2: item.subClassification2
          };
        })) ||
      [];
  }
}

export class PutProjectData {
  name: string;
  start_date: string;
  end_date: string;
  objectives: string;
  revision_count: number;

  constructor(obj?: any) {
    this.name = obj?.project_name || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.objectives = obj?.objectives || null;
    this.revision_count = obj?.revision_count ?? null;
  }
}

export interface IPutConservationArea {
  conservationArea: string;
}
export class PutLocationData {
  geometry: Feature[];
  region: number;
  is_within_overlapping: string;
  number_sites: number;
  size_ha: number;
  conservationAreas: IPutConservationArea[];
  revision_count: number;

  constructor(obj?: any) {
    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
    this.region = obj?.region || null;
    this.number_sites = obj?.number_sites || null;
    this.size_ha = obj?.size_ha || null;
    this.is_within_overlapping = (obj?.is_within_overlapping && JSON.parse(obj.is_within_overlapping)) || null;
    this.conservationAreas =
      (obj?.conservationAreas?.length &&
        obj.conservationAreas.map((item: any) => {
          return {
            conservationArea: item.conservationArea
          };
        })) ||
      [];
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutPartnershipsData {
  partnerships: string[];

  constructor(obj?: any) {
    this.partnerships = (obj?.partnerships?.length && obj.partnerships) || [];
  }
}

export class PutObjectivesData {
  objectives: string[];

  constructor(obj?: any) {
    this.objectives = (obj?.objectives?.length && obj.objectives) || [];
  }
}

export class PutConservationAreasData {
  conservationAreas: string[];

  constructor(obj?: any) {
    this.conservationAreas = (obj?.conservationAreas?.length && obj.conservationAreas) || [];
  }
}

export class PutFundingData {
  fundingSources: PostFundingSource[];

  constructor(obj?: any) {
    this.fundingSources =
      (obj?.fundingSources?.length && obj.fundingSources.map((item: any) => new PostFundingSource(item))) || [];
  }
}

export class PutSpeciesData {
  focal_species: number[];

  constructor(obj?: any) {
    this.focal_species = (obj?.focal_species.length && obj.focal_species) || [];
  }
}
