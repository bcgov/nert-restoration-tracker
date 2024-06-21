import maplibre, { GeoJSONSource, NavigationControl, Source } from 'maplibre-gl';
import * as turf from '@turf/turf';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import {
  IMarkerState,
  initMapBaseSource,
  initMapCommunityLayer,
  initMapCommunitySource,
  initMapIndigenousAreasLayer,
  initMapIndigenousAreasSource,
  initMapMarkerClusterLabelsLayer,
  initMapMarkerClusterPointsLayer,
  initMapMarkerPlanLayer,
  initMapMarkerPolygonLayer,
  initMapMarkerProjectLayer,
  initMapMarkersSource,
  initMapMaskLayer,
  initMapMaskSource,
  initMapNEBoundaryLayer,
  initMapNEBoundarySource,
  initMapWildlifeAreasLayer,
  initMapWildlifeAreasSource,
  IToolTipState
} from 'models/maps';
import {
  addMapLayer,
  addMapSource,
  handleAddPlanPopup,
  handleAddProjectPopup,
  handleClusterClick,
  handleHoverPolygons,
  handleLoadImages,
  handleTooltip
} from './mapLibreUtils';
import { ILayerVisibility, IUseState } from 'models/maps';
import { IMarker } from 'components/map/components/MarkerCluster';

/**
 * # rerenderMap - Initialize the map with the features
 *
 * @param {string} mapId
 * @param {number} zoom
 * @param {Feature[]} features
 * @param {ILayerVisibility} layerVisibility
 * @param {IMarkerState} markerState
 * @param {(IUseState<number | undefined>)} activeFeatureState
 * @param {ITooltipState} tooltipState
 * @param {(LngLatLike | undefined)} [center]
 * @param {boolean} [centroids]
 */
export const rerenderMap = (
  map: maplibre.Map,
  layerVisibility: ILayerVisibility,
  markerState: IMarkerState,
  activeFeatureState: IUseState<number | undefined>,
  tooltipState: IToolTipState,
  centroids?: boolean,
  features?: Feature[],
  markers?: IMarker[]
) => {
  const markerGeoJSON: FeatureCollection =
    markers && centroids ? convertToCentroidGeoJSON(markers) : convertToGeoJSON(features || []);

  map.addControl(
    new NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true
    })
  );

  /**
   * # loadLayers
   * Load all custom layers here
   */
  map.on('load', async () => {
    /* Avoid double renders */
    if (map.getSource('maptiler.raster-dem')) return;

    /* The base layer */
    addMapSource(map, 'maptiler.raster-dem', initMapBaseSource());

    /*
    If there is no auth token for the terrain, catch the error.
    Otherwise the rest of the layers will not load.
  */
    try {
      map.setTerrain({ source: 'maptiler.raster-dem' });
    } catch (err) {
      console.error('Error setting terrain:', err);
    }

    /**
     * Draw the masked polygons
     */
    const maskGeojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    if (features?.length) {
      features
        .filter((feature: Feature) => feature.properties?.maskedLocation)
        .forEach((feature: Feature) => {
          const specs: [turf.helpers.Position, number] = initializeMasks(feature);
          const maskPolygon = createMask(specs, feature);
          maskGeojson.features.push(maskPolygon);
        });
    }

    addMapSource(map, 'mask', initMapMaskSource(maskGeojson));
    addMapLayer(map, initMapMaskLayer());

    /**
     * Add the custom communities layer
     */
    addMapSource(map, 'communities', initMapCommunitySource());
    addMapLayer(map, initMapCommunityLayer());

    /* The boundary layer */
    addMapSource(map, 'ne_boundary', initMapNEBoundarySource());
    addMapLayer(map, initMapNEBoundaryLayer(layerVisibility.boundary));

    /*****************Project/Plans********************/
    addMapSource(map, 'markers', initMapMarkersSource(markerGeoJSON, centroids || false));
    addMapLayer(map, initMapMarkerProjectLayer(layerVisibility.projects));
    addMapLayer(map, initMapMarkerPlanLayer(layerVisibility.plans));
    addMapLayer(map, initMapMarkerClusterPointsLayer());
    addMapLayer(map, initMapMarkerClusterLabelsLayer());
    addMapLayer(map, initMapMarkerPolygonLayer());

    // Load the images
    handleLoadImages(map, markerState);

    // hover state
    handleHoverPolygons(map, activeFeatureState);

    // zoom in until the clusters breaks
    handleClusterClick(map);

    /* Add project popup for the points */
    handleAddProjectPopup(map);

    /* Add plan popup for the points */
    handleAddPlanPopup(map);

    // Tooltip state
    handleTooltip(map, tooltipState);

    /* Protected Areas as WMS layers from the BCGW */
    addMapSource(map, 'wildlife-areas', initMapWildlifeAreasSource());
    addMapLayer(map, initMapWildlifeAreasLayer(layerVisibility.wildlife));

    /* Indigenous Areas as WMS layers from the BCGW */
    addMapSource(map, 'indigenous-areas', initMapIndigenousAreasSource());
    addMapLayer(map, initMapIndigenousAreasLayer(layerVisibility.indigenous));
  });
};

/**
 * initializeMasks
 * Draw the mask polygons around the features if required.
 * @param features Array of features
 * @return Array containing the mask centroid and radius
 */
export const initializeMasks = (feature: Feature): [turf.helpers.Position, number] => {
  const centroid = turf.centroid(feature as turf.Feature);
  const bbox = turf.bbox(feature);

  const p1 = turf.point([bbox[0], bbox[1]]);
  const p2 = turf.point([bbox[2], bbox[3]]);
  const buffer = turf.distance(p1, p2, { units: 'meters' }) / 2;
  const area = turf.area(feature) * 100;
  const innerRadius = Math.sqrt(area / Math.PI);
  const outerRadius = innerRadius + buffer;

  // Calculate the random centroid within the innerRadius
  const rr = innerRadius * Math.sqrt(Math.random());
  const rt = Math.random() * 2 * Math.PI;
  const rx = rr * Math.cos(rt);
  const ry = rr * Math.sin(rt);
  const mercCentroid = turf.toMercator(centroid);
  mercCentroid.geometry.coordinates[0] += rx;
  mercCentroid.geometry.coordinates[1] += ry;
  const newCentroid = turf.toWgs84(mercCentroid);

  return [newCentroid.geometry.coordinates, outerRadius];
};

/**
 * # convertToCentroidGeoJSON
 * @param array - the feature data
 * @returns object - the GeoJSON object
 */
export const convertToCentroidGeoJSON = (features: IMarker[]): FeatureCollection => {
  const geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: features.map((feature) => {
      const f = feature.popup && feature.popup.props.featureData;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: feature.position as [number, number]
        },
        properties: {
          id: f.id,
          name: f.name,
          is_project: f.is_project
        }
      };
    })
  };
  return geojson;
};

/**
 * # convertToGeoJSON - Convert the features to a GeoJSON object
 *
 * @param {Feature[]} features
 * @return {*}  {FeatureCollection}
 */
export const convertToGeoJSON = (features: Feature[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: features
  };
};

/**
 * # updateMasks
 * This is when the user has clicked on a widget to turn on or off a mask.
 */
export const updateMasks = (map: maplibre.Map, mask: number, features: Feature[]): void => {
  if (!map.getSource('mask')) return;

  const maskGeojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: features
      .map((feature: Feature, index: number) => {
        let specs: [turf.helpers.Position, number] | undefined = undefined;

        // Clicked to turn on
        if (index === mask && feature.properties?.maskedLocation === true) {
          specs = initializeMasks(feature);

          // Clicked to turn off
        } else if (index === mask && feature.properties?.maskedLocation === false) {
          specs = [feature.properties.mask.centroid, feature.properties.mask.radius];

          // Not clicked but has an existing mask
        } else if (feature.properties?.maskedLocation) {
          specs = [feature.properties.mask.centroid, feature.properties.mask.radius];

          // Not clicked and no mask
        } else {
          specs = undefined;
        }

        if (specs) {
          const maskPolygon = createMask(specs, feature);
          return maskPolygon;
        } else {
          // If there is no mask, return the original to get removed below
          return feature;
        }
      })
      .filter((feature: Feature) => feature.properties?.maskedLocation)
  };

  const source = map.getSource('mask');

  if (isGeoJsonSource(source)) {
    source?.setData(JSON.stringify(maskGeojson));
  }
};

/**
 * # isGeoJsonSource - Check if the source is a GeoJSON source
 *
 * @param {Source} [source]
 * @return {*}  {source is GeoJSONSource}
 */
export const isGeoJsonSource = (source?: Source): source is GeoJSONSource =>
  source?.type === 'geojson';

/**
 * # createMask - Create a mask around the feature
 *
 * @param {[turf.helpers.Position, number]} params
 * @param {Feature} feature
 * @return {*}  {Feature<Geometry>}
 */
export const createMask = (
  params: [turf.helpers.Position, number],
  feature: Feature
): Feature<Geometry> => {
  const properties = feature.properties || {};
  properties.mask = { centroid: params[0], radius: params[1] };
  const centroid = turf.point(params[0]);

  return turf.circle(centroid, params[1], {
    steps: 64,
    units: 'meters',
    properties: properties
  });
};

/**
 * # checkFeatureState - Check the feature state and update the hover state
 *
 *
 * @param {maplibre.Map} map
 * @param {(IUseState<number | undefined>)} featureState
 * @return {*}  {void}
 */
export const checkFeatureState = (
  map: maplibre.Map,
  featureState: IUseState<number | undefined>
): void => {
  if (!map.getSource('markers')) return; // Exit if markers are not initialized

  // If there is a feature state, set the hover state
  if (featureState[0]) {
    map.setFeatureState(
      {
        source: 'markers',
        id: featureState[0]
      },
      { hover: true }
    );
  }
};
