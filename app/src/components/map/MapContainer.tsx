import * as turf from '@turf/turf';
import { Feature, FeatureCollection } from 'geojson';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import ReactDomServer from 'react-dom/server';
import React, { useEffect, useState } from 'react';
import communities from './layers/communities.json';
import ne_boundary from './layers/north_east_boundary.json';
import './mapContainer.css'; // Custom styling
import MapPopup from './components/Popup';
import { useNertApi } from 'hooks/useNertApi';
import { S3FileType } from 'constants/attachments';

const { Map, Popup, NavigationControl } = maplibre;

export interface IMapDrawControlsProps {
  features?: FeatureCollection[];
  onChange?: (ref: any) => void;
}

export interface IMapContainerProps {
  mapId: string;
  center?: any;
  zoom?: any;
  bounds?: any;
  features?: any;
  layerVisibility?: any;
  centroids?: boolean;
  mask?: null | number; // Store what mask just changed
  maskState?: boolean[]; // Store which features are masked
  activeFeatureState?: any; // Store which feature is active
  autoFocus?: boolean;
  editModeOn?: boolean; // This activates things like mask drawing
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

  /**
   * Another layer to display is Dormant Wells
   * Example of display is seen here https://geoweb-ags.bc-er.ca/portal/apps/webappviewer/index.html?id=b8a2b40512a8493284fc3c322077e677
   * This layer is around 2.4Mg in size and should possibly be consumed as a vector tile
   */
  // const dormantWellsURL = 'https://geoweb-ags.bc-er.ca/arcgis/rest/services/PASR/PASR_WELL_SURFACE_STATE_FA_PT/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';

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
      const f = feature.feature;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: feature.position
        },
        properties: {
          id: f.id,
          name: f.name,
          is_project: f.is_project,
          state_code: f.state_code,
          number_sites: f.number_sites,
          size_ha: f.size_ha
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

/**
 * initializeMasks
 * Draw the mask polygons around the features if required.
 * @param features Array of features
 * @return Array containing the mask centroid and radius
 */
type radiusType = number;
type maskParams = [any, radiusType];

const initializeMasks = (feature: Feature): maskParams => {
  const centroid = turf.centroid(feature as any);
  const bbox = turf.bbox(feature);

  const p1 = turf.point([bbox[0], bbox[1]]);
  const p2 = turf.point([bbox[2], bbox[3]]);
  const buffer = turf.distance(p1, p2, { units: 'meters' }) / 2;
  let area = turf.area(feature) * 100;
  if (area < 100000) area = 100000;
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

const createMask = (params: maskParams, feature: Feature) => {
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
 * # updateMasks
 * This is when the user has clicked on a widget to turn on or off a mask.
 */
const updateMasks = (mask: number, maskState: boolean[], features: any) => {
  if (!map.getSource('mask')) return;
  const maskGeojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: features
      .map((feature: any, index: any) => {
        let specs: maskParams | undefined;

        // Clicked to turn on
        if (index === mask && feature.properties?.maskedLocation === true) {
          specs = initializeMasks(feature);

          // Clicked to turn off
        } else if (index === mask && feature.properties?.maskedLocation === false) {
          if (feature.properties && feature.properties.mask && feature.properties.mask.centroid) {
            specs = [feature.properties.mask.centroid, feature.properties.mask.radius];
          }
          // Not clicked but has an existing mask
        } else if (feature.properties?.maskedLocation) {
          specs = [feature.properties.mask.centroid, feature.properties.mask.radius];

          // Not clicked and no mask
        } else {
          specs = undefined;
        }

        if (specs && specs.length > 0) {
          const maskPolygon = createMask(specs, feature);
          return maskPolygon;
        } else {
          // If there is no mask, return the original to get removed below
          return feature;
        }
      })
      .filter((feature: any) => feature.properties?.maskedLocation)
  };
  // @ts-ignore
  map.getSource('mask').setData(maskGeojson);
};

let hoverStateMarkerPolygon: boolean | any = false;
const checkFeatureState = (featureState: any) => {
  if (!map.getSource('markers')) return; // Exit if markers are not initialized

  if (hoverStateMarkerPolygon) {
    map.setFeatureState(
      {
        source: 'markers',
        id: hoverStateMarkerPolygon
      },
      { hover: false }
    );
  }

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

  hoverStateMarkerPolygon = featureState[0] || false;
};

const initializeMap = (
  mapId: string,
  center: any = [-124, 55],
  zoom = 5,
  features?: any,
  layerVisibility?: any,
  centroids = false,
  tooltipState?: any,
  activeFeatureState?: any,
  markerState?: any,
  bounds?: any,
  autoFocus?: boolean,
  nertApi?: any,
  editModeOn?: boolean
) => {
  const { boundary, wells, projects, plans, wildlife, indigenous } = layerVisibility;

  const { setTooltip, setTooltipVisible, setTooltipX, setTooltipY } = tooltipState;

  const { setProjectMarker, setPlanMarker } = markerState;

  const markerGeoJSON = centroids ? convertToCentroidGeoJSON(features) : convertToGeoJSON(features);

  map = new Map({
    container: mapId,
    // style: '/styles/bcgov.json',
    // style: '/styles/from_gov_site.json',
    style: '/styles/from_the_main_page.json',
    center: center,
    // Use transformRequest to set the Referrer Policy to no-referrer-when-downgrade
    // This is required for the BC Gov WMS layers
    // transformRequest: (url: string, resourceType: string) => {
    //   console.log('url', url);
    //   console.log('resourceType', resourceType);
    //   if (resourceType === 'Tile' && url.includes('tiles.arcgis.com')) {
    //     return {
    //       url: url,
    //       headers: {
    //         'Referrer Policy': 'no-referrer-when-downgrade'
    //       },
    //       credentials: 'include'
    //     };
    //   }
    // },
    zoom: zoom,
    maxPitch: 65,
    hash: 'loc',
    attributionControl: {
      compact: true,
      customAttribution: 'Basemap from <a href="https://esri.com">Esri</a>'
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
  map.on('load', async () => {
    /* Avoid double renders */
    if (map.getSource('maptiler.raster-dem')) return;

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

    /**
     * Draw the masked polygons
     */
    if (editModeOn) {
      const maskGeojson: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };

      features
        .filter((feature: any) => feature.properties?.maskedLocation)
        .forEach((feature: any) => {
          const specs: any = initializeMasks(feature);
          const maskPolygon = createMask(specs, feature);
          maskGeojson.features.push(maskPolygon);
        });

      map.addSource('mask', {
        type: 'geojson',
        data: maskGeojson
      });
      map.addLayer({
        id: 'mask',
        type: 'line',
        source: 'mask',
        paint: {
          'line-width': 4,
          'line-color': 'orange',
          'line-dasharray': [3, 2],
          'line-blur': 2
        }
      });
    }

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
        'line-color': 'white',
        'line-width': 2
      }
    });

    /*****************Project/Plans********************/
    map.addSource('markers', {
      type: 'geojson',
      data: markerGeoJSON as FeatureCollection,
      cluster: centroids ? true : false,
      clusterRadius: 50,
      clusterMaxZoom: 12,
      promoteId: 'id'
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
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          'rgba(3, 252, 252,0.4)',
          'rgba(250,250,0,0.4)'
        ]
      }
    });
    map.addLayer({
      id: 'markerPolygonOutline',
      type: 'line',
      source: 'markers',
      filter: ['all', ['==', '$type', 'Polygon']],
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-width': 3,
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          'rgba(3, 252, 252,1)',
          'rgba(250,250,0,1)'
        ]
      }
    });

    /**
     * This is to work around an async quirk in maplibre-gl.
     * Use React hooks to force maplibre to refresh the plans and projects
     * layers once the images are loaded. This only seems to be a thing with
     * image icons styling for geojson points.
     */
    const projectMarkerFile = await map.loadImage('/assets/icon/marker-icon.png');
    setProjectMarker(projectMarkerFile.data);
    map.addImage('blue-marker', projectMarkerFile.data);

    const planMarkerFile = await map.loadImage('/assets/icon/marker-icon2.png');
    setPlanMarker(planMarkerFile.data);
    map.addImage('orange-marker', planMarkerFile.data);

    // Hover over polygons
    map
      .on('mouseenter', 'markerPolygon', (e: any) => {
        map.getCanvas().style.cursor = 'pointer';

        checkFeatureState(activeFeatureState);
        if (activeFeatureState[1]) activeFeatureState[1](e.features[0].id);
      })
      .on('mouseleave', 'markerPolygon', () => {
        map.getCanvas().style.cursor = '';

        if (activeFeatureState[1]) activeFeatureState[1](null);
      });

    // Clicking polygons show the thumbnail
    map.on('click', 'markerPolygon', async (e: any) => {
      console.log('e.features[0]', e.features[0]);
      console.log('e', e);
      const prop = e.features[0].properties;
      const id = prop.id;
      const name = prop.siteName || '';
      const isProject = prop.is_project;
      const areaHa = prop.areaHa;
      const maskedLocation = prop.maskedLocation;

      const mapPopupHtml = ReactDomServer.renderToString(
        <MapPopup
          name={name}
          id={id}
          is_project={isProject}
          size_ha={areaHa}
          hideButton={true}
          maskedLocation={maskedLocation}
        />
      );

      // @ts-ignore
      new Popup({ offset: { bottom: [0, -14] } })
        .setLngLat(e.lngLat)
        .setHTML(mapPopupHtml)
        .addTo(map);
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

    /* Add popup for the points */
    map.on('click', 'markerProjects.points', async (e: any) => {
      const prop = e.features![0].properties;
      const id = prop.id;
      const name = prop.name;
      const isProject = prop.is_project;
      const numberSites = prop.number_sites;
      const sizeHa = prop.size_ha;
      const stateCode = prop.state_code;

      let thumbnail = '';
      try {
        const thumbnailResponse = await nertApi.public.project.getProjectAttachments(
          Number(id),
          S3FileType.THUMBNAIL
        );
        thumbnail = thumbnailResponse.attachmentsList[0].url;
      } catch (error) {
        console.error('Error getting thumbnail');
      }

      /**
       * Maplibre only accepts a string for the popup content.
       * Convert the Popup component to a string here.
       * MUI front end library was not able to inline styles within the HTML string.
       * Custom styling was used instead.
       */
      const mapPopupHtml = ReactDomServer.renderToString(
        <MapPopup
          name={name}
          id={id}
          is_project={isProject}
          number_sites={numberSites}
          size_ha={sizeHa}
          state_code={stateCode}
          thumbnail={thumbnail}
        />
      );

      // @ts-ignore
      new Popup({ offset: { bottom: [0, -14] } })
        .setLngLat(e.lngLat)
        .setHTML(mapPopupHtml)
        .addTo(map);
    });
    map.on('mousemove', 'markerProjects.points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'markerProjects.points', () => {
      map.getCanvas().style.cursor = '';
    });

    /* Add popup for the points */
    map.on('click', 'markerPlans.points', async (e: any) => {
      const prop = e.features![0].properties;
      const id = prop.id;
      const name = prop.name;
      const isProject = prop.is_project;
      const numberSites = prop.number_sites;
      const sizeHa = prop.size_ha;
      const stateCode = prop.state_code;

      let thumbnail = '';
      try {
        const thumbnailResponse = await nertApi.public.project.getProjectAttachments(
          Number(id),
          S3FileType.THUMBNAIL
        );

        thumbnail = thumbnailResponse.attachmentsList[0].url;
      } catch (error) {
        console.error('Error getting thumbnail');
      }

      const mapPopupHtml = ReactDomServer.renderToString(
        <MapPopup
          name={name}
          id={id}
          is_project={isProject}
          number_sites={numberSites}
          size_ha={sizeHa}
          state_code={stateCode}
          thumbnail={thumbnail}
        />
      );

      // @ts-ignore
      new Popup({ offset: { bottom: [0, -14] } })
        .setLngLat(e.lngLat)
        .setHTML(mapPopupHtml)
        .addTo(map);
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

    // If bounds are provided, fit the map to the bounds with a buffer
    if (bounds) {
      map.fitBounds(bounds, { padding: 50 });
    } else if (autoFocus && features.length > 0) {
      const featureCollection = turf.featureCollection(features);
      const newBounds = turf.bbox(featureCollection);

      // @ts-ignore - turf types are incorrect here
      map.fitBounds(newBounds, { padding: 150 });
    }
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
    const baseLayerUrls: { [key: string]: string } = {
      hybrid:
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      terrain: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      bcgov:
        'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}'
    };
    // Changing a base layer operates a little differently
    if (layer === 'baselayer' && map.getStyle()) {
      const currentStyle = map.getStyle();
      const newBase: string = baseLayerUrls[layers.baselayer[0]];

      (currentStyle.sources['raster-tiles'] as maplibre.RasterTileSource).tiles = [newBase];
      map.setStyle(currentStyle);
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

  const maskState = props.maskState || [];
  const mask = props.mask || 0;
  const activeFeatureState = props.activeFeatureState || [];

  const autoFocus = props.autoFocus || false;

  const { bounds } = props || null;

  const editModeOn = props.editModeOn || false;

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

  /**
   * Maplibre has some quirky behavour with loading images, so
   * use React to manage the state.
   */
  const [projectMarker, setProjectMarker] = useState<any>();
  const [planMarker, setPlanMarker] = useState<any>();

  const markerState = {
    projectMarker,
    setProjectMarker,
    planMarker,
    setPlanMarker
  };

  const nertApi = useNertApi();

  // Create the map on initial load
  useEffect(() => {
    initializeMap(
      mapId,
      center,
      zoom,
      features,
      layerVisibility,
      centroids,
      tooltipState,
      activeFeatureState,
      markerState,
      bounds,
      autoFocus,
      nertApi,
      editModeOn
    );
  }, []);

  // Listen to layer changes
  // useEffect(() => {
  //   if (centroids) {
  //     checkLayerVisibility(layerVisibility, convertToCentroidGeoJSON(features));
  //   } else {
  //     checkLayerVisibility(layerVisibility, convertToGeoJSON(features));
  //   }
  // }, [layerVisibility, projectMarker, planMarker]);

  // Listen for masks being turned on and off
  useEffect(() => {
    updateMasks(mask, maskState, features);
  }, [mask, maskState]);

  // Listen for active feature changes
  useEffect(() => {
    checkFeatureState(activeFeatureState);
  }, [activeFeatureState]);

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
