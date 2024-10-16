import * as turf from '@turf/turf';
import axios, { AxiosError } from 'axios';
import { Feature } from 'geojson';
import { SQL, SQLStatement } from 'sql-template-strings';
import { ApiGeneralError } from '../errors/custom-error';
import { CodeSet } from '../repositories/code-repository';

export interface IWFSParams {
  url?: string;
  version?: string;
  srsName?: string;
  request?: string;
  outputFormat?: string;
  bboxSrsName?: string;
}

export const defaultWFSParams: IWFSParams = {
  url: 'https://openmaps.gov.bc.ca/geo/pub/wfs',
  version: '1.3.0',
  srsName: 'epsg:4326',
  request: 'GetFeature',
  outputFormat: 'json',
  bboxSrsName: 'epsg:4326'
};

export interface IUTM {
  easting: number;
  northing: number;
  zone_letter: string | undefined;
  zone_number: number;
  zone_srid: number;
}

const NORTH_UTM_BASE_ZONE_NUMBER = 32600;
const SOPUTH_UTM_BASE_ZONE_NUMBER = 32700;

const NORTH_UTM_ZONE_LETTERS = ['N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];
const SOUTH_UTM_ZONE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];

const UTM_STRING_FORMAT = RegExp(/^[1-9]\d?[NPQRSTUVWXCDEFGHJKLM]? \d+ \d+$/i);
const UTM_ZONE_WITH_LETTER_FORMAT = RegExp(/^[1-9]\d?[NPQRSTUVWXCDEFGHJKLM]$/i);

/**
 * Take in a feature and replace the geometry with a mask if it exists.
 * @param {Feature} feature
 * @return {Feature} original feature or feature with mask applied
 */
export const maskGateKeeper = (feature: Feature): Feature => {
  const properties = feature.properties;

  if (properties?.maskedLocation && properties?.mask) {
    const mask = turf.circle(properties?.mask.centroid, properties?.mask.radius, {
      steps: 64,
      units: 'meters',
      properties
    });

    return mask;
  }

  return feature;
};

/**
 * Parses a UTM string of the form: `9N 573674 6114170`
 *
 * String format: `"<zone_number><zone_letter> <easting> <northing>"`
 *
 * @export
 * @param {string} utm
 * @return {*}  {(IUTM | null)}
 */
export function parseUTMString(utm: string): IUTM | null {
  if (!utm || !UTM_STRING_FORMAT.test(utm)) {
    // utm string is null or does not match the expected format
    return null;
  }

  const utmParts = utm.split(' ');

  let zone_letter;
  let zone_number;

  const hasZoneLetter = UTM_ZONE_WITH_LETTER_FORMAT.test(utmParts[0]);

  if (hasZoneLetter) {
    zone_number = Number(utmParts[0].slice(0, -1));
    zone_letter = utmParts[0].slice(-1).toUpperCase();
  } else {
    zone_number = Number(utmParts[0]);
  }

  if (zone_number < 1 || zone_number > 60) {
    // utm zone number is invalid
    return null;
  }

  const easting = Number(utmParts[1]);
  if (easting < 166640 || easting > 833360) {
    // utm easting is invalid
    return null;
  }

  const northing = Number(utmParts[2]);

  let zone_srid;

  if (!zone_letter || NORTH_UTM_ZONE_LETTERS.includes(zone_letter)) {
    if (northing < 0 || northing > 9334080) {
      // utm northing is invalid
      return null;
    }

    // If `zone_letter` is not defined, then assume northern hemisphere
    zone_srid = NORTH_UTM_BASE_ZONE_NUMBER + zone_number;
  } else if (SOUTH_UTM_ZONE_LETTERS.includes(zone_letter)) {
    if (northing < 1110400 || northing > 10000000) {
      // utm northing is invalid
      return null;
    }

    zone_srid = SOPUTH_UTM_BASE_ZONE_NUMBER + zone_number;
  } else {
    return null;
  }

  return { easting, northing, zone_letter, zone_number, zone_srid };
}

export interface ILatLong {
  lat: number;
  long: number;
}

const LAT_LONG_STRING_FORMAT = RegExp(/^[+-]?(\d*[.])?\d+ [+-]?(\d*[.])?\d+$/i);

/**
 * Parses a `latitude longitude` string of the form: `49.116906	-122.62887`
 *
 * @export
 * @param {string} latLong
 * @return {*}  {(ILatLong | null)}
 */
export function parseLatLongString(latLong: string): ILatLong | null {
  if (!latLong || !LAT_LONG_STRING_FORMAT.test(latLong)) {
    // latLong string is null or does not match the expected format
    return null;
  }

  const latLongParts = latLong.split(' ');

  const lat = Number(latLongParts[0]);
  if (lat < -90 || lat > 90) {
    // latitude is invalid
    return null;
  }

  const long = Number(latLongParts[1]);
  if (long < -180 || long > 180) {
    // longitude is invalid
    return null;
  }

  return { lat, long };
}

export const getNRMRegions = async (): Promise<CodeSet> => {
  const typeName = 'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG';

  const NRM_REGIONS_URL = buildWFSURLByBoundingBox(typeName, defaultWFSParams);

  try {
    const response = await axios.post(NRM_REGIONS_URL);

    return response.data.features.map((item: any) => {
      return {
        id: item.properties.OBJECTID,
        name: item.properties.REGION_NAME
      };
    });
  } catch (error) {
    throw new ApiGeneralError('Failed to fetch NRM Regions', [error as AxiosError]);
  }
};

/**
 * Construct a WFS url to fetch layer information based on a bounding box.
 *
 * @param {string} typeName layer name
 * @param {string} bbox bounding box string
 * @param {IWFSParams} [wfsParams=defaultWFSParams] wfs url parameters. Will use defaults specified in
 * `defaultWFSParams` for any properties not provided.
 * @return {*}
 */
export const buildWFSURLByBoundingBox = (typeName: string, wfsParams: IWFSParams = defaultWFSParams, bbox?: string) => {
  const params = { ...defaultWFSParams, ...wfsParams };

  if (!bbox) {
    return `${params.url}?service=WFS&&version=${params.version}&request=${params.request}&typeName=${typeName}&outputFormat=${params.outputFormat}&srsName=${params.srsName}`;
  }

  return `${params.url}?service=WFS&&version=${params.version}&request=${params.request}&typeName=${typeName}&outputFormat=${params.outputFormat}&srsName=${params.srsName}&bbox=${bbox},${params.bboxSrsName}`;
};

/*
  Function to generate the SQL for insertion of a geometry collection
*/
export function generateGeometryCollectionSQL(geometry: Feature[]): SQLStatement {
  if (geometry.length === 1) {
    const geo = JSON.stringify(geometry[0].geometry);

    return SQL`public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo}))`;
  }

  const sqlStatement: SQLStatement = SQL`public.ST_AsText(public.ST_Collect(array[`;

  geometry.forEach((geom: Feature, index: number) => {
    const geo = JSON.stringify(geom.geometry);

    // as long as it is not the last geometry, keep adding to the ST_collect
    if (index !== geometry.length - 1) {
      sqlStatement.append(SQL`
        public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo})),
      `);
    } else {
      sqlStatement.append(SQL`
        public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo}))]))
      `);
    }
  });

  return sqlStatement;
}
