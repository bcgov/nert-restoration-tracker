import React, { useState } from 'react';
import maplibre from 'maplibre-gl';
import { FeatureCollection } from 'geojson';
import { communities } from 'constants/layers/communities';
import { north_east_boundary } from 'constants/layers/north_east_boundary';

export interface IUseState<T> {
  0: T;
  1: React.Dispatch<React.SetStateAction<T>>;
}

export interface ILayerVisibility {
  boundary: IUseState<boolean>;
  wells: IUseState<boolean>;
  projects: IUseState<boolean>;
  plans: IUseState<boolean>;
  wildlife: IUseState<boolean>;
  indigenous: IUseState<boolean>;
  baselayer: IUseState<string>;
}

export interface ILayerVisibilityDefaultValues {
  boundary: boolean;
  wells: boolean;
  projects: boolean;
  plans: boolean;
  wildlife: boolean;
  indigenous: boolean;
  baselayer: string;
}

export const layerVisibilityDefaultValues = {
  boundary: true,
  wells: false,
  projects: true,
  plans: true,
  wildlife: false,
  indigenous: false,
  baselayer: 'maptiler.raster-dem'
};

export class LayerVisibility implements ILayerVisibility {
  boundary: IUseState<boolean>;
  wells: IUseState<boolean>;
  projects: IUseState<boolean>;
  plans: IUseState<boolean>;
  wildlife: IUseState<boolean>;
  indigenous: IUseState<boolean>;
  baselayer: IUseState<string>;

  constructor(init: ILayerVisibilityDefaultValues) {
    const [boundary, setBoundary] = useState<boolean>(init.boundary);
    const [wells, setWells] = useState<boolean>(init.wells);
    const [projects, setProjects] = useState<boolean>(init.projects);
    const [plans, setPlans] = useState<boolean>(init.plans);
    const [wildlife, setWildlife] = useState<boolean>(init.wildlife);
    const [indigenous, setIndigenous] = useState<boolean>(init.indigenous);
    const [baselayer, setBaselayer] = useState<string>(init.baselayer);

    this.boundary = [boundary, setBoundary];
    this.wells = [wells, setWells];
    this.projects = [projects, setProjects];
    this.plans = [plans, setPlans];
    this.wildlife = [wildlife, setWildlife];
    this.indigenous = [indigenous, setIndigenous];
    this.baselayer = [baselayer, setBaselayer];
  }
}

export interface IToolTipState {
  tooltipVisibleState: IUseState<boolean>;
  tooltipInfo: IUseState<string>;
  tooltipXYState: IUseState<number[]>; // [x, y]
}

export class ToolTipHandler implements IToolTipState {
  tooltipVisibleState: IUseState<boolean>;
  tooltipInfo: IUseState<string>;
  tooltipXYState: IUseState<number[]>;

  constructor() {
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const [tooltip, setTooltip] = useState<string>('');
    const [tooltipXY, setTooltipXY] = useState<number[]>([0, 0]);

    this.tooltipVisibleState = [tooltipVisible, setTooltipVisible];
    this.tooltipInfo = [tooltip, setTooltip];
    this.tooltipXYState = [tooltipXY, setTooltipXY];
  }
}

export interface IMarkerState {
  planMarkerState: IUseState<HTMLImageElement | ImageBitmap | undefined>;
  projectMarkerState: IUseState<HTMLImageElement | ImageBitmap | undefined>;
}

export class MarkerHandler implements IMarkerState {
  planMarkerState: IUseState<HTMLImageElement | ImageBitmap | undefined>;
  projectMarkerState: IUseState<HTMLImageElement | ImageBitmap | undefined>;

  constructor() {
    const [planMarker, setPlanMarker] = useState<HTMLImageElement | ImageBitmap | undefined>();
    const [projectMarker, setProjectMarker] = useState<
      HTMLImageElement | ImageBitmap | undefined
    >();

    this.planMarkerState = [planMarker, setPlanMarker];
    this.projectMarkerState = [projectMarker, setProjectMarker];
  }
}

export interface IMaskState {
  maskState: IUseState<boolean[]>;
  mask: IUseState<null | number>;
}

export class MaskHandler implements IMaskState {
  maskState: IUseState<boolean[]>;
  mask: IUseState<null | number>;

  constructor() {
    const [maskState, setMaskState] = useState<boolean[]>([]);
    const [mask, setMask] = useState<null | number>(null);

    this.maskState = [maskState, setMaskState];
    this.mask = [mask, setMask];
  }
}

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
