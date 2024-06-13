import maplibre from 'maplibre-gl';
import { communities } from './layers/communities';
import { north_east_boundary } from './layers/north_east_boundary';
import { IUseState } from 'contexts/mapContext';
import { FeatureCollection } from 'geojson';

const MAPTILER_API_KEY = process.env.REACT_APP_MAPTILER_API_KEY;
const baseUrl = `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_API_KEY}`;

export enum MAPLIBRE_URLS {
  SITES = 'https://geoweb-ags.bc-er.ca/arcgis/rest/services/OPERATIONAL/ORPHAN_SITE_PT/MapServer/0/query?outFields=*&where=1%3D1&f=geojson',
  ACTIVITIES = 'https://geoweb-ags.bc-er.ca/arcgis/rest/services/OPERATIONAL/ORPHAN_ACTIVITY_PT/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson',
  WILDLIFE_AREA = 'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_WILDLIFE_MANAGEMENT.WCP_UNGULATE_WINTER_RANGE_SP,WHSE_WILDLIFE_MANAGEMENT.WCP_WILDLIFE_HABITAT_AREA_POLY',
  INDIGENOUS_AREA = 'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_TANTALIS.TA_MGMT_AREAS_SPATIAL_SVW'
}

export const initMapBaseSource = (): maplibre.SourceSpecification => {
  return {
    type: 'raster-dem',
    url: baseUrl
  };
};

export const initMapWellSource = (): maplibre.SourceSpecification => {
  return {
    type: 'geojson',
    data: MAPLIBRE_URLS.SITES
  };
};

export const initMapWellLayer = (wells: IUseState<boolean>): maplibre.LayerSpecification => {
  return {
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
  };
};

export const initMapActivitiesSource = (): maplibre.SourceSpecification => {
  return {
    type: 'geojson',
    data: MAPLIBRE_URLS.ACTIVITIES
  };
};

export const initMapActivitiesLayer = (wells: IUseState<boolean>): maplibre.LayerSpecification => {
  return {
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
  };
};

export const initMapCommunitySource = (): maplibre.SourceSpecification => {
  return {
    type: 'geojson',
    data: communities as FeatureCollection,
    promoteId: 'fid'
  };
};

export const initMapCommunityLayer = (): maplibre.LayerSpecification => {
  return {
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
  };
};

export const initMapNEBoundarySource = (): maplibre.SourceSpecification => {
  return {
    type: 'geojson',
    data: north_east_boundary as FeatureCollection
  };
};

export const initMapNEBoundaryLayer = (
  boundary: IUseState<boolean>
): maplibre.LayerSpecification => {
  return {
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
  };
};

export const initMapMaskSource = (maskGeojson: FeatureCollection): maplibre.SourceSpecification => {
  return {
    type: 'geojson',
    data: maskGeojson
  };
};

export const initMapMaskLayer = (): maplibre.LayerSpecification => {
  return {
    id: 'mask',
    type: 'line',
    source: 'mask',
    paint: {
      'line-width': 4,
      'line-color': 'orange',
      'line-dasharray': [3, 2],
      'line-blur': 2
    }
  };
};

export const initMapMarkersSource = (
  markerGeoJSON: FeatureCollection,
  centroids: boolean
): maplibre.SourceSpecification => {
  return {
    type: 'geojson',
    data: markerGeoJSON as FeatureCollection,
    cluster: centroids ? true : false,
    clusterRadius: 50,
    clusterMaxZoom: 12,
    promoteId: 'id'
  };
};

export const initMapMarkerProjectLayer = (
  projects: IUseState<boolean>
): maplibre.LayerSpecification => {
  return {
    id: 'markerProjects.points',
    type: 'symbol',
    source: 'markers',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'is_project', true]],
    layout: {
      visibility: projects[0] ? 'visible' : 'none',
      'icon-image': 'blue-marker',
      'icon-size': 1
    }
  };
};

export const initMapMarkerPlanLayer = (plans: IUseState<boolean>): maplibre.LayerSpecification => {
  return {
    id: 'markerPlans.points',
    type: 'symbol',
    source: 'markers',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'is_project', false]],
    layout: {
      visibility: plans[0] ? 'visible' : 'none',
      'icon-image': 'orange-marker',
      'icon-size': 1
    }
  };
};

export const initMapMarkerClusterPointsLayer = (): maplibre.LayerSpecification => {
  return {
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
  };
};

export const initMapMarkerClusterLabelsLayer = (): maplibre.LayerSpecification => {
  return {
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
  };
};

export const initMapMarkerPolygonLayer = (): maplibre.LayerSpecification => {
  return {
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
        'rgba(250,191,120,0.4)'
      ]
    }
  };
};

export const initMapWildlifeAreasSource = (): maplibre.SourceSpecification => {
  return {
    type: 'raster',
    tiles: [MAPLIBRE_URLS.WILDLIFE_AREA],
    tileSize: 256,
    minzoom: 10
  };
};

export const initMapWildlifeAreasLayer = (
  wildlife: IUseState<boolean>
): maplibre.LayerSpecification => {
  return {
    id: 'wms-wildlife-areas',
    type: 'raster',
    source: 'wildlife-areas',
    layout: {
      visibility: wildlife[0] ? 'visible' : 'none'
    },
    paint: {
      'raster-opacity': 0.5
    }
  };
};

export const initMapIndigenousAreasSource = (): maplibre.SourceSpecification => {
  return {
    type: 'raster',
    tiles: [MAPLIBRE_URLS.INDIGENOUS_AREA],
    tileSize: 256,
    minzoom: 4
  };
};

export const initMapIndigenousAreasLayer = (
  indigenous: IUseState<boolean>
): maplibre.LayerSpecification => {
  return {
    id: 'wms-indigenous-areas',
    type: 'raster',
    source: 'indigenous-areas',
    layout: {
      visibility: indigenous[0] ? 'visible' : 'none'
    },
    paint: {
      'raster-opacity': 0.5
    }
  };
};
