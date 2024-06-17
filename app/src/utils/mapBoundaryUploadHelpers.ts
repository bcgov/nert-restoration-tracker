import bbox from '@turf/bbox';
import * as turf from '@turf/turf';
import { FormikContextType } from 'formik';
import { BBox, Feature, GeoJSON } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import get from 'lodash-es/get';
import { v4 as uuidv4 } from 'uuid';

// TODO: Make the cleaning of the GeoJSON exportable so it can be used in other places.

/**
 *
 * @param file File object to upload
 * @param name Name of the formik field that the parsed geometry will be saved to
 * @param formikProps The formik props
 * @returns
 */
export const handleGeoJSONUpload = async <T>(
  file: File,
  name: string,
  formikProps: FormikContextType<T>
) => {
  const { values, setFieldValue, setFieldError } = formikProps;

  const fileAsString = await file?.text().then((jsonString: string) => {
    return jsonString;
  });

  if (!file?.name.includes('json') && !fileAsString?.includes('Feature')) {
    setFieldError(name, 'You must upload a GeoJSON file, please try again.');
    return;
  }

  const cleanFeature = (feature: Feature) => {
    // Exit out if the feature is not a Polygon or MultiPolygon
    if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
      return;
    }
    const area = turf.area(feature);
    const p = feature.properties || {};

    p.siteName = p.siteName || p.Site_Name || '';
    p.areaHectares = p.areaHectares || p.Area_Hectares || Math.round(area / 100) / 100;
    p.maskedLocation = p.maskedLocation || p.Masked_Location || false;

    feature.properties = p;
    return feature;
  };

  /**
   * If the object is a single Feature, clean it.
   * If the object is a FeatureCollection, clean all features.
   * If the object is not a Feature or FeatureCollection, display an error.
   * Always return a clean FeatureCollection.
   * @param geojson
   * @param callback
   * @returns Cleaned GeoJSON
   */
  const cleanGeoJSON = (geojson: GeoJSON) => {
    if (geojson.type === 'Feature') {
      const cleanF = cleanFeature(geojson);
      return { type: 'FeatureCollection', features: [cleanF] };
    } else if (geojson.type === 'FeatureCollection') {
      const cleanFeatures = geojson.features.map(cleanFeature);
      if (cleanFeatures.length === 0) {
        return { type: 'FeatureCollection', features: [] };
      } else {
        return { type: 'FeatureCollection', features: cleanFeatures };
      }
    } else {
      setFieldError(
        name,
        'Invalid GeoJSON file. Hint: Make sure there is a Feature or FeatureCollection within your JSON file.'
      );
      return { type: 'FeatureCollection', features: [] };
    }
  };

  try {
    const geojson = JSON.parse(fileAsString);

    const geojsonWithAttributes = cleanGeoJSON(geojson);
    // If there are no features, display an error that that only Polygon or MultiPolygon features are supported

    if (geojsonWithAttributes?.features.length <= 0) {
      setFieldError(name, 'Only Polygon or MultiPolygon features are supported.');
      return;
    }

    // Merge the new features with the existing features
    const allFeatures = [...get(values, name), ...geojsonWithAttributes.features];

    // Recalculate the IDs for all features
    const allFeaturesWithIds = allFeatures.map((feature, index) => {
      feature.properties.id = index + 1;
      return feature;
    });

    setFieldValue(name, allFeaturesWithIds);
  } catch (error) {
    setFieldError(name, 'Error uploading your GeoJSON file, please check the file and try again.');
  }
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
