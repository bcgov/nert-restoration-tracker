import { gpx, kml } from '@tmcw/togeojson';
import bbox from '@turf/bbox';
import { FormikContextType } from 'formik';
import { BBox, Feature, GeoJSON } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import get from 'lodash-es/get';
import shp from 'shpjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Function to handle zipped shapefile spatial boundary uploads
 *
 * @template T Type of the formikProps (should be auto-determined if the incoming formikProps are properly typed)
 * @param {File} file The file to upload
 * @param {string} name The name of the formik field that the parsed geometry will be saved to
 * @param {FormikContextType<T>} formikProps The formik props
 * @return {*}
 */
export const handleShapefileUpload = <T>(
  file: File,
  name: string,
  formikProps: FormikContextType<T>
) => {
  const { values, setFieldValue, setFieldError } = formikProps;

  // Back out if not a zipped file
  if (!file?.type.match(/zip/) || !file?.name.includes('.zip')) {
    setFieldError(name, 'You must upload a valid shapefile (.zip format). Please try again.');
    return;
  }

  // Create a file reader to extract the binary data
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  // When the file is loaded run the conversion
  reader.onload = async (event: any) => {
    // The converter wants a buffer
    const zip: Buffer = event?.target?.result as Buffer;

    // Exit out if no zip
    if (!zip) {
      return;
    }

    // Run the conversion
    const geojson = await shp(zip);

    let features: Feature[] = [];
    if (Array.isArray(geojson)) {
      geojson.forEach((item) => {
        features = features.concat(item.features);
      });
    } else {
      features = geojson.features;
    }

    setFieldValue(name, [...features, ...get(values, name)]);
  };
};

/**
 * Function to handle GPX file spatial boundary uploads
 *
 * @template T Type of the formikProps (should be auto-determined if the incoming formikProps are properly typed)
 * @param {File} file The file to upload
 * @param {string} name The name of the formik field that the parsed geometry will be saved to
 * @param {FormikContextType<T>} formikProps The formik props
 * @return {*}
 */
export const handleGPXUpload = async <T>(
  file: File,
  name: string,
  formikProps: FormikContextType<T>
) => {
  const { values, setFieldValue, setFieldError } = formikProps;

  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (!file?.type.includes('gpx') && !fileAsString?.includes('</gpx>')) {
    setFieldError(name, 'You must upload a GPX file, please try again.');
    return;
  }

  try {
    const domGpx = new DOMParser().parseFromString(fileAsString, 'application/xml');
    const geoJson = gpx(domGpx);

    const sanitizedGeoJSON: Feature[] = [];
    geoJson.features.forEach((feature: Feature) => {
      if (feature.geometry) {
        sanitizedGeoJSON.push(feature);
      }
    });

    setFieldValue(name, [...sanitizedGeoJSON, ...get(values, name)]);
  } catch (error) {
    setFieldError(name, 'Error uploading your GPX file, please check the file and try again.');
  }
};

/**
 * Function to handle KML file spatial boundary uploads
 *
 * @template T Type of the formikProps (should be auto-determined if the incoming formikProps are properly typed)
 * @param {File} file The file to upload
 * @param {string} name The name of the formik field that the parsed geometry will be saved to
 * @param {FormikContextType<T>} formikProps The formik props
 * @return {*}
 */
export const handleKMLUpload = async <T>(
  file: File,
  name: string,
  formikProps: FormikContextType<T>
) => {
  const { values, setFieldValue, setFieldError } = formikProps;

  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (file?.type !== 'application/vnd.google-earth.kml+xml' && !fileAsString?.includes('</kml>')) {
    setFieldError(name, 'You must upload a KML file, please try again.');
    return;
  }

  const domKml = new DOMParser().parseFromString(fileAsString, 'application/xml');
  const geojson = kml(domKml);

  const sanitizedGeoJSON: Feature[] = [];
  geojson.features.forEach((feature: Feature) => {
    if (feature.geometry) {
      sanitizedGeoJSON.push(feature);
    }
  });

  setFieldValue(name, [...sanitizedGeoJSON, ...get(values, name)]);
};

/**
 * Calculates the bounding box that encompasses all of the given features
 *
 * @param features The features used to calculate the bounding box
 * @returns The bounding box, or undefined if a bounding box cannot be calculated.
 */
export const calculateFeatureBoundingBox = (features: Feature[]): BBox | undefined => {
  // If no geometries, we do not need to set bounds
  if (!features.length) {
    return;
  }

  /**
   * If there is only one geometry and it is a point, we cannot automatically calculate
   * a bounding box, because leaflet does not know how to handle the scale, and tries
   * to zoom in way too much. In this case, we manually create a bounding box.
   */
  if (features.length === 1 && features[0]?.geometry?.type === 'Point') {
    const singlePoint = features[0]?.geometry;
    const [longitude, latitude] = singlePoint.coordinates;

    return [longitude + 1, latitude + 1, longitude - 1, latitude - 1];
  }

  /**
   * If there are multiple points or a polygon and a point, we can automatically
   * create a bounding box using Turf.
   */
  const allGeosFeatureCollection = {
    type: 'FeatureCollection',
    features: [...features]
  };

  return bbox(allGeosFeatureCollection);
};

/**
 * Converts a bounding box to a lat/long bounds expression
 * @param boundingBox
 * @returns
 */
export const latLngBoundsFromBoundingBox = (boundingBox: BBox): LatLngBoundsExpression => {
  return [
    [boundingBox[1], boundingBox[0]],
    [boundingBox[3], boundingBox[2]]
  ];
};

/**
 * Calculates the bounding box that encompasses all of the given features
 *
 * @param features The features used to calculate the map bounds
 * @returns The Lat/Long bounding box, or undefined if a bounding box cannot be calculated.
 */
export const calculateUpdatedMapBounds = (
  features: Feature[]
): LatLngBoundsExpression | undefined => {
  const bboxCoords = calculateFeatureBoundingBox(features);

  if (!bboxCoords) {
    return;
  }

  return latLngBoundsFromBoundingBox(bboxCoords);
};

/*
  Leaflet does not know how to draw Multipolygons or GeometryCollections
  that are not in proper GeoJSON format so we manually convert to a Feature[]
  of GeoJSON objects which it can draw using the <GeoJSON /> tag for
  non-editable geometries

  We also set the bounds based on those geometries so the extent is set
*/
export const generateValidGeometryCollection = (geometry: GeoJSON[], id?: string) => {
  const geometryCollection: Feature[] = [];
  const bounds: any[] = [];

  if (!geometry || !geometry.length) {
    return { geometryCollection, bounds };
  }

  if (geometry[0]?.type === 'MultiPolygon') {
    geometry[0].coordinates.forEach((geoCoords) => {
      geometryCollection.push({
        id: id || uuidv4(),
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: geoCoords
        },
        properties: {}
      });
    });
  } else if (geometry[0]?.type === 'GeometryCollection') {
    geometry[0].geometries.forEach((item) => {
      geometryCollection.push({
        id: id || uuidv4(),
        type: 'Feature',
        geometry: item,
        properties: {}
      });
    });
  } else if (geometry[0]?.type === 'FeatureCollection') {
    geometry[0].features.forEach((item) => {
      geometryCollection.push({
        ...item,
        id: id || uuidv4(),
        type: 'Feature',
        properties: {}
      });
    });
  } else if (geometry[0]?.type !== 'Feature') {
    geometryCollection.push({
      id: id || uuidv4(),
      type: 'Feature',
      geometry: geometry[0],
      properties: {}
    });
  } else {
    geometryCollection.push(geometry[0]);
  }

  const allGeosFeatureCollection = {
    type: 'FeatureCollection',
    features: geometryCollection
  };

  if (geometry[0]?.type !== 'Point') {
    const bboxCoords = bbox(allGeosFeatureCollection);

    bounds.push([bboxCoords[1], bboxCoords[0]], [bboxCoords[3], bboxCoords[2]]);

    return { geometryCollection, bounds };
  }

  return { geometryCollection };
};
