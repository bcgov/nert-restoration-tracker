import { FeatureCollection } from 'geojson';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect } from 'react';
import ne_boundary from './layers/north_east_boundary.json';

const { Map, NavigationControl } = maplibre;

export interface IMapDrawControlsProps {
  features?: FeatureCollection[];
  onChange?: (ref: any) => void;
}

export interface IMapContainerProps {
  mapId: string;
  center?: any;
  zoom?: any;
  markers?: any;
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
const drawWells = (map: maplibre.Map) => {
  /* The following are the URLs to the geojson data */
  const orphanedWellsURL =
    'https://geoweb-ags.bc-er.ca/arcgis/rest/services/OPERATIONAL/ORPHAN_WELL_PT/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
  const orphanedActivitiesURL =
    'https://geoweb-ags.bc-er.ca/arcgis/rest/services/OPERATIONAL/ORPHAN_ACTIVITY_PT/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
  const surfaceStateURL =
    'https://geoweb-ags.bc-er.ca/arcgis/rest/services/PASR/PASR_WELL_SURFACE_STATE_PT/MapServer/0/query?outFields=*&where=1%3D1&f=geojson';

  // Orphaned wells
  map.addSource('orphanedWells', {
    type: 'geojson',
    data: orphanedWellsURL
  });
  map.addLayer({
    id: 'orphanedWellsLayer',
    type: 'circle',
    source: 'orphanedWells',
    paint: {
      'circle-radius': 5,
      'circle-color': 'red'
    }
  });

  // Orphaned activities
  map.addSource('orphanedActivities', {
    type: 'geojson',
    data: orphanedActivitiesURL
  });
  map.addLayer({
    id: 'orphanedActivitiesLayer',
    type: 'circle',
    source: 'orphanedActivities',
    paint: {
      'circle-radius': 5,
      'circle-color': 'blue'
    }
  });

  // Surface state
  map.addSource('surfaceState', {
    type: 'geojson',
    data: surfaceStateURL
  });
  map.addLayer({
    id: 'surfaceStateLayer',
    type: 'circle',
    source: 'surfaceState',
    paint: {
      'circle-radius': 5,
      'circle-color': 'green'
    }
  });
};

let map: maplibre.Map;

const initializeMap = (mapId: string, center: any, zoom: number, markers: any) => {
  console.log('markers in initializeMap', markers);
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

  map.on('load', () => {
    /* The base layer */
    map.addSource('maptiler.raster-dem', {
      type: 'raster-dem',
      url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_API_KEY}`
    });
    map.setTerrain({ source: 'maptiler.raster-dem' });

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
        'line-cap': 'round'
      },
      paint: {
        'line-color': 'yellow',
        'line-width': 2
      }
    });

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
      paint: {
        'raster-opacity': 0.5
      }
    });

    /* Indigenous Areas as WMS layers from the BCGW */
    map.addSource('indigenous-areas', {
      type: 'raster',
      tiles: [
        'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_TANTALIS.TA_MGMT_AREAS_SPATIAL_SVW'
        // TODO: The reserve layer below will be replaced by a custom point layer. But use the WMS layer as a reference for creating this new dataset.
        // "https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_TANTALIS.TA_MGMT_AREAS_SPATIAL_SVW,WHSE_ADMIN_BOUNDARIES.CLAB_INDIAN_RESERVES",
      ],
      tileSize: 256,
      minzoom: 4
    });
    map.addLayer({
      id: 'wms-indigenous-areas',
      type: 'raster',
      source: 'indigenous-areas',
      paint: {
        'raster-opacity': 0.5
      }
    });
    // Add the well layers
    drawWells(map);
  });
};

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { mapId, center, zoom, markers } = props;

  useEffect(() => {
    initializeMap(mapId, center, zoom, markers);
  });

  return <div id={mapId} style={pageStyle}></div>;
};

export default MapContainer;
