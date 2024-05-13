import * as turf from '@turf/turf';
import { FeatureCollection } from 'geojson';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useState } from 'react';
import communities from './layers/communities.json';
import ne_boundary from './layers/north_east_boundary.json';
import './mapContainer2Style.css'; // Custom styling

const { Map, Popup, NavigationControl } = maplibre;

export interface IMapDrawControlsProps {
  features?: FeatureCollection[];
  onChange?: (ref: any) => void;
}

export interface IMapContainerProps {
  mapId: string;
  center?: any;
  zoom?: any;
  features?: any;
  layerVisibility?: any;
  centroids?: boolean;
}

const MAPTILER_API_KEY = process.env.REACT_APP_MAPTILER_API_KEY;

const pageStyle = {
  width: '100%',
  height: '100%'
};

/*
 * This function draws the wells on the map
 * @param map - the map object
 */
const drawWells = (map: maplibre.Map, wells: any) => {
  /* The following are the URLs to the geojson data */
  const orphanedSitesURL =
    'https://geoweb-ags.bc-er.ca/arcgis/rest/services/OPERATIONAL/ORPHAN_SITE_PT/MapServer/0/query?outFields=*&where=1%3D1&f=geojson';
  const orphanedActivitiesURL =
    'https://geoweb-ags.bc-er.ca/arcgis/rest/services/OPERATIONAL/ORPHAN_ACTIVITY_PT/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';

  map.addSource('orphanedWells', {
    type: 'geojson',
    data: orphanedSitesURL
  });
  map.addLayer({
    id: 'orphanedWellsLayer',
    type: 'circle',
    source: 'orphanedWells',
    layout: {
      visibility: wells[0] ? 'visible' : 'none'
    },
    paint: {
      'circle-radius': 7,
      'circle-stroke-color': 'black',
      'circle-stroke-width': 1,
      'circle-stroke-opacity': 0.5,
      'circle-color': [
        'match',
        ['get', 'SITE_STATUS'],
        'Assessed',
        '#f0933e',
        'Inactive',
        '#999999',
        'Decommissioned',
        '#7fb2f9',
        'Reclaimed',
        '#adc64f',
        'black'
      ]
    }
  });

  // Orphaned activities - These are called "Activities" on the BCER site
  map.addSource('orphanedActivities', {
    type: 'geojson',
    data: orphanedActivitiesURL
  });
  map.addLayer({
    id: 'orphanedActivitiesLayer',
    type: 'circle',
    source: 'orphanedActivities',
    layout: {
      visibility: wells[0] ? 'visible' : 'none'
    },
    paint: {
      'circle-radius': [
        'match',
        ['get', 'WORKSTREAM_SHORT'],
        'Deactivation',
        8,
        'Abandonment',
        10,
        'Decommissioning',
        12,
        'Investigation',
        14,
        'Remediation',
        16,
        'Reclamation',
        18,
        0
      ],
      'circle-color': 'rgba(0, 0, 0, 0)',
      'circle-stroke-width': 3,
      'circle-stroke-color': [
        'match',
        ['get', 'WORKSTREAM_SHORT'],
        'Deactivation',
        '#fffe7d',
        'Abandonment',
        '#ee212f',
        'Decommissioning',
        '#4a72b5',
        'Investigation',
        '#f6b858',
        'Remediation',
        '#a92fe2',
        'Reclamation',
        '#709958',
        'black'
      ]
    }
  });
};

/**
 * # convertToCentroidGeoJSON
 * @param array - the feature data
 * @returns object - the GeoJSON object
 */
const convertToCentroidGeoJSON = (features: any) => {
  const geojson = {
    type: 'FeatureCollection',
    features: features.map((feature: any) => {
      const f = feature.popup.props.featureData;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: feature.position
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

const convertToGeoJSON = (features: any) => {
  return {
    type: 'FeatureCollection',
    features: features
  };
};

let map: maplibre.Map;

// const drawFeatures = (map: maplibre.Map, features: any, centroid: boolean) => {
//   console.log('features', features);
//   console.log('centroid', centroid);
// };

const initializeFeatures = (features: any) => {
  const centroid = turf.centroid(features[0]);
  const bbox = turf.bbox(features[0]);
  console.log('centroid', centroid);

  const p1 = turf.point([bbox[0], bbox[1]]);
  const p2 = turf.point([bbox[2], bbox[3]]);
  const buffer = turf.distance(p1, p2, { units: 'meters' }) / 2;
  const area = turf.area(features[0]) * 100;
  const innerRadius = Math.sqrt(area / Math.PI);
  const outerRadius = innerRadius + buffer;

  // Calculate the random centroid within the innerRadius
  const rr = innerRadius * Math.sqrt(Math.random());
  const rt = Math.random() * 2 * Math.PI;
  const rx = rr * Math.cos(rt);
  const ry = rr * Math.sin(rt);
  console.log('rx', rx);
  console.log('ry', ry);

  const innerMask = turf.circle(centroid, innerRadius, {
    steps: 64,
    units: 'meters',
    properties: features[0].properties
  });
  const outerMask = turf.circle(centroid, outerRadius, {
    steps: 64,
    units: 'meters',
    properties: features[0].properties
  });

  // Add the mask to the map
  map.addSource('mask', {
    type: 'geojson',
    data: innerMask
  });
  map.addLayer({
    id: 'mask',
    type: 'line',
    source: 'mask',
    layout: {},
    paint: {
      'line-width': 2,
      'line-color': 'aqua'
    }
  });

  // Add the mask to the map
  map.addSource('outermask', {
    type: 'geojson',
    data: outerMask
  });
  map.addLayer({
    id: 'outermask',
    type: 'line',
    source: 'outermask',
    layout: {},
    paint: {
      'line-width': 2,
      'line-color': 'aqua'
    }
  });
};

const initializeMap = (
  mapId: string,
  center: any = [-124, 57],
  zoom: number = 6,
  features?: any, // There's no features when first creating a record
  layerVisibility?: any,
  centroids: boolean = false,
  tooltipState?: any
) => {
  const { boundary, wells, projects, plans, wildlife, indigenous } = layerVisibility;

  const {
    tooltip,
    setTooltip,
    tooltipVisible,
    setTooltipVisible,
    tooltipX,
    setTooltipX,
    tooltipY,
    setTooltipY
  } = tooltipState;

  // To satisfy the linter until I think of a better way to use these variables
  console.log('tooltip', tooltip);
  console.log('tooltipVisible', tooltipVisible);
  console.log('tooltipX', tooltipX);
  console.log('tooltipY', tooltipY);

  const markerGeoJSON = centroids ? convertToCentroidGeoJSON(features) : convertToGeoJSON(features);

  map = new Map({
    container: mapId,
    style: '/styles/hybrid.json',
    center: center,
    zoom: zoom,
    maxPitch: 80,
    hash: 'loc',
    attributionControl: {
      compact: true,
      customAttribution: 'Powered by <a href="https://esri.com">Esri</a>'
    }
  });

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
  map.on('load', () => {
    /* The base layer */
    map.addSource('maptiler.raster-dem', {
      type: 'raster-dem',
      url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_API_KEY}`
    });

    /*
      If there is no auth token for the terrain, catch the error.
      Otherwise the rest of the layers will not load.
     */
    try {
      map.setTerrain({ source: 'maptiler.raster-dem' });
    } catch (err) {
      console.error('Error setting terrain:', err);
    }

    initializeFeatures(features);
    /**
     * Add the custom communities layer
     */
    map.addSource('communities', {
      type: 'geojson',
      data: communities as FeatureCollection,
      promoteId: 'fid'
    });
    map.addLayer({
      id: 'communities',
      type: 'symbol',
      source: 'communities',
      minzoom: 6,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open SansSemibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 1],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': 'black',
        'text-halo-color': 'white',
        'text-halo-width': 1,
        'text-halo-blur': 1
      }
    });

    /* The boundary layer */
    map.addSource('ne_boundary', {
      type: 'geojson',
      data: ne_boundary as FeatureCollection
    });
    map.addLayer({
      id: 'ne_boundary',
      type: 'line',
      source: 'ne_boundary',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        visibility: boundary[0] ? 'visible' : 'none'
      },
      paint: {
        'line-color': 'yellow',
        'line-width': 2
      }
    });

    /*****************Project/Plans********************/
    // drawFeatures(map, features, centroids);

    map.loadImage('/assets/icon/marker-icon.png').then((image) => {
      map.addImage('blue-marker', image.data);
    });
    map.loadImage('/assets/icon/marker-icon2.png').then((image) => {
      map.addImage('orange-marker', image.data);
    });

    map.addSource('markers', {
      type: 'geojson',
      data: markerGeoJSON as FeatureCollection,
      promoteId: 'id',
      cluster: centroids ? true : false,
      clusterRadius: 50,
      clusterMaxZoom: 12
    });

    map.addLayer({
      id: 'markerProjects.points',
      type: 'symbol',
      source: 'markers',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'is_project', true]],
      layout: {
        visibility: projects[0] ? 'visible' : 'none',
        'icon-image': 'blue-marker',
        'icon-size': 1
      }
    });
    map.addLayer({
      id: 'markerPlans.points',
      type: 'symbol',
      source: 'markers',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'is_project', false]],
      layout: {
        visibility: plans[0] ? 'visible' : 'none',
        'icon-image': 'orange-marker',
        'icon-size': 1
      }
    });

    map.addLayer({
      id: 'markerClusters.points',
      type: 'circle',
      source: 'markers',
      filter: ['all', ['has', 'point_count']],
      layout: {
        visibility: 'visible'
      },
      paint: {
        'circle-color': 'rgba(127,222,122,0.8)',
        'circle-radius': 18,
        'circle-stroke-width': 5,
        'circle-stroke-color': 'rgba(127,222,122,0.3)'
      }
    });
    map.addLayer({
      id: 'markerClusterLabels',
      type: 'symbol',
      source: 'markers',
      filter: ['all', ['has', 'point_count']],
      layout: {
        visibility: 'visible',
        'text-field': '{point_count_abbreviated}',
        'text-size': 16
      },
      paint: {
        'text-color': '#000'
      }
    });

    map.addLayer({
      id: 'markerPolygon',
      type: 'fill',
      source: 'markers',
      filter: ['all', ['==', '$type', 'Polygon']],
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-color': 'rgba(245,149,66,0.8)'
      }
    });

    // Zoom in until cluster breaks apart.
    map.on('click', 'markerClusters.points', (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const clusterId = e.features[0].properties.cluster_id;

      // @ts-ignore
      map
        .getSource('markers')
        // @ts-ignore
        .getClusterExpansionZoom(clusterId)
        .then((zoom: any) => {
          map.easeTo({
            center: coordinates,
            zoom: zoom
          });
        });
    });

    /**
     * # makePopup
     * Try and standardize the popup for the projects and plans
     * @param name
     * @param id
     * @param isProject
     * @returns HTML string
     */
    const makePopup = (name: string, id: string, isProject: boolean) => {
      const divStyle = '"text-align: center;"';
      const buttonStyle =
        '"margin-top: 1rem; font-size: 1.2em; font-weight: bold; background: #003366; cursor: pointer; border-radius: 5px; color: white; padding: 7px 20px; border: none; text-align: center; text-decoration: none; display: inline-block; font-family: Arial, sans-serif;"';
      return `
        <div style=${divStyle}>
          <div>${isProject ? 'Project' : 'Plan'} Name: <b>${name}</b></div>
          <div class="view-btn">
            <a href="/${isProject ? 'projects' : 'plans'}/${id}" >
              <button style=${buttonStyle} title="Take me to the details page">View Project Details</button>
            </a>
          </div>
        </div>`;
    };

    /* Add popup for the points */
    map.on('click', 'markerProjects.points', (e: any) => {
      const prop = e.features![0].properties;

      const html = makePopup(prop.name, prop.id, true);

      // @ts-ignore
      new Popup({ offset: { bottom: [0, -14] } }).setLngLat(e.lngLat).setHTML(html).addTo(map);
    });
    map.on('mousemove', 'markerProjects.points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'markerProjects.points', () => {
      map.getCanvas().style.cursor = '';
    });

    /* Add popup for the points */
    map.on('click', 'markerPlans.points', (e: any) => {
      const prop = e.features![0].properties;

      // TBD: Currently the /plans route is not available
      // const html = makePopup(prop.name, prop.id, false);
      const html = makePopup(prop.name, prop.id, false);

      // @ts-ignore
      new Popup({ offset: { bottom: [0, -14] } }).setLngLat(e.lngLat).setHTML(html).addTo(map);
    });

    let hoverStatePlans: any = false;
    const showTooltip = (e: any) => {
      map.getCanvas().style.cursor = 'pointer';

      setTooltipVisible(true);

      /**
       * Calculate the coordinates of the tooltip based on
       * the mouse position and icon size
       */
      const coordinates = e.features[0].geometry.coordinates;
      const location = map.project(coordinates);
      setTooltipX(location.x + 10);
      setTooltipY(location.y - 34);
      setTooltip(e.features[0].properties.name);

      if (hoverStatePlans !== false) {
        map.setFeatureState(
          {
            source: 'markers',
            id: hoverStatePlans
          },
          { hover: true }
        );
      }

      // Geometry state
      hoverStatePlans = e.features[0].id;
      map.setFeatureState(
        {
          source: 'markers',
          id: hoverStatePlans
        },
        { hover: true }
      );
    };

    const hideTooltip = () => {
      map.getCanvas().style.cursor = '';
      setTooltipVisible(false);
      setTooltip('');
    };

    // Hover over the plans
    map.on('mouseenter', 'markerPlans.points', showTooltip);
    map.on('mouseleave', 'markerPlans.points', hideTooltip);

    // Hover over the projects
    map.on('mouseenter', 'markerProjects.points', showTooltip);
    map.on('mouseleave', 'markerProjects.points', hideTooltip);
    /**************************************************/

    /*******************Fires**************************/
    map.addSource('forestfire-areas', {
      type: 'raster',
      tiles: [
        'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_FOREST_VEGETATION.VEG_BURN_SEVERITY_SP,WHSE_LAND_AND_NATURAL_RESOURCE.PROT_CURRENT_FIRE_POLYS_SP'
      ],
      tileSize: 256,
      minzoom: 10
    });
    map.addLayer({
      id: 'wms-forestfire-areas',
      type: 'raster',
      source: 'forestfire-areas',
      // layout: {
      //   visibility: wildlife[0] ? 'visible' : 'none'
      // },
      paint: {
        'raster-opacity': 0.9
      }
    });
    /*******************Fires**************************/

    /* Protected Areas as WMS layers from the BCGW */
    map.addSource('wildlife-areas', {
      type: 'raster',
      tiles: [
        'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_WILDLIFE_MANAGEMENT.WCP_UNGULATE_WINTER_RANGE_SP,WHSE_WILDLIFE_MANAGEMENT.WCP_WILDLIFE_HABITAT_AREA_POLY'
      ],
      tileSize: 256,
      minzoom: 10
    });
    map.addLayer({
      id: 'wms-wildlife-areas',
      type: 'raster',
      source: 'wildlife-areas',
      layout: {
        visibility: wildlife[0] ? 'visible' : 'none'
      },
      paint: {
        'raster-opacity': 0.5
      }
    });

    /* Indigenous Areas as WMS layers from the BCGW */
    map.addSource('indigenous-areas', {
      type: 'raster',
      tiles: [
        'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_TANTALIS.TA_MGMT_AREAS_SPATIAL_SVW'
      ],
      tileSize: 256,
      minzoom: 4
    });
    map.addLayer({
      id: 'wms-indigenous-areas',
      type: 'raster',
      source: 'indigenous-areas',
      layout: {
        visibility: indigenous[0] ? 'visible' : 'none'
      },
      paint: {
        'raster-opacity': 0.5
      }
    });
    // Add the well layers
    drawWells(map, wells);
  });
};

/**
 * # checkLayerVisibility
 *
 * Loop through the layer visibility object and check the visibility
 * of the layers. It is important to make sure the map is initialized
 * along with each layer.
 *
 * The individual layers are grouped together in a custom fashion, so
 * we need to check the visibility of each group.
 *
 * @param layers Layer visibility object
 * @returns void
 */
const checkLayerVisibility = (layers: any, features: any) => {
  if (!map) return; // Exist if map is not initialized

  Object.keys(layers).forEach((layer) => {
    // The boundary layer is simple enough.
    if (layer === 'boundary' && map.getLayer('ne_boundary')) {
      map.setLayoutProperty('ne_boundary', 'visibility', layers[layer][0] ? 'visible' : 'none');
    }

    // Wells is a group of three different point layers
    if (
      layer === 'wells' &&
      map.getLayer('orphanedWellsLayer') &&
      map.getLayer('orphanedActivitiesLayer')
    ) {
      map.setLayoutProperty(
        'orphanedWellsLayer',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
      map.setLayoutProperty(
        'orphanedActivitiesLayer',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
    }

    // This is a concatenated (server side) WMS layer from the BCGW
    if (layer === 'wildlife' && map.getLayer('wms-wildlife-areas')) {
      map.setLayoutProperty(
        'wms-wildlife-areas',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
    }

    // This will be extended to include indigenous community point locations
    if (layer === 'indigenous' && map.getLayer('wms-indigenous-areas')) {
      map.setLayoutProperty(
        'wms-indigenous-areas',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
    }

    // Projects
    if (layer === 'projects' && map.getLayer('markerProjects.points')) {
      map.setLayoutProperty(
        'markerProjects.points',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
    }

    // Plans
    if (layer === 'plans' && map.getLayer('markerPlans.points')) {
      map.setLayoutProperty(
        'markerPlans.points',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
    }

    // Some sample basemap layers
    const baseLayerUrls = {
      hybrid:
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      terrain: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      bcgov:
        'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}'
    };
    // Changing a base layer operates a little differently
    if (layer === 'baselayer' && map.getStyle()) {
      const currentStyle = map.getStyle();
      const rasterSource = currentStyle.sources['raster-tiles'] as maplibre.RasterTileSource;
      const currentBase = rasterSource.tiles[0];
      // @ts-ignore
      if (currentBase !== baseLayerUrls[layers.baselayer[0]]) {
        // @ts-ignore
        currentStyle.sources['raster-tiles'].tiles = [baseLayerUrls[layers.baselayer[0]]];
        map.setStyle(currentStyle);
      }
    }
  });

  /**
   * In order for the cluster layer to work, we need to filter the source here.
   * Only run once for both projects and plans.
   */
  const plansVisible = layers.plans[0];
  const projectsVisible = layers.projects[0];
  const filteredFeatures = features.features.filter((feature: any) => {
    return plansVisible && !feature.properties.is_project
      ? feature
      : projectsVisible && feature.properties.is_project
      ? feature
      : null;
  });
  if (map.getSource('markers')) {
    // @ts-ignore
    map.getSource('markers').setData({ type: 'FeatureCollection', features: filteredFeatures });
  }
};

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { mapId, center, zoom, features, centroids, layerVisibility } = props;

  // Tooltip variables
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);

  // Package the tooltip state to pass to the map
  const tooltipState = {
    tooltip,
    setTooltip,
    tooltipVisible,
    setTooltipVisible,
    tooltipX,
    setTooltipX,
    tooltipY,
    setTooltipY
  };

  // Update the map if the markers change
  useEffect(() => {
    // TODO: Maybe change this so only the features get redrawn.. not the whole map.
    initializeMap(mapId, center, zoom, features, layerVisibility, centroids, tooltipState);
    if (map.loaded() && features.length > 0) initializeFeatures(features);
  }, [features]);

  // Listen to layer changes
  useEffect(() => {
    if (centroids) {
      checkLayerVisibility(layerVisibility, convertToCentroidGeoJSON(features));
    } else {
      checkLayerVisibility(layerVisibility, convertToGeoJSON(features));
    }
  }, [layerVisibility]);

  return (
    <div id={mapId} style={pageStyle}>
      <div
        id="tooltip"
        className={tooltipVisible ? 'visible' : 'tooltip'}
        style={{ left: tooltipX, top: tooltipY }}>
        {tooltip}
      </div>
    </div>
  );
};

export default MapContainer;
