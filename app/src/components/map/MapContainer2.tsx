import { FeatureCollection } from 'geojson';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect } from 'react';
import ne_boundary from './layers/north_east_boundary.json';

const { Map, Popup, NavigationControl } = maplibre;

export interface IMapDrawControlsProps {
  features?: FeatureCollection[];
  onChange?: (ref: any) => void;
}

export interface IMapContainerProps {
  mapId: string;
  center?: any;
  zoom?: any;
  markers?: any;
  layerVisibility?: any;
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
    layout: {
      visibility: wells[0] ? 'visible' : 'none'
    },
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
    layout: {
      visibility: wells[0] ? 'visible' : 'none'
    },
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
    layout: {
      visibility: wells[0] ? 'visible' : 'none'
    },
    paint: {
      'circle-radius': 5,
      'circle-color': 'green'
    }
  });
};

/*
 * This function converts the feature data to GeoJSON
 * @param array - the feature data
 * @returns object - the GeoJSON object
 */
const convertToGeoJSON = (features: any) => {
  const geojson = {
    type: 'FeatureCollection',
    features: features.map((feature: any) => {
      const f = feature.popup.props.featureData;
      return {
        type: 'Feature',
        geometry: {
          type: f.geometry[0].type,
          coordinates: f.geometry[0].coordinates
        },
        properties: {
          id: f.id,
          name: f.name
        }
      };
    })
  };
  return geojson;
};

let map: maplibre.Map;

const initializeMap = (
  mapId: string,
  center: any,
  zoom: number,
  markers: any,
  layerVisibility?: any
) => {
  const { boundary, wells, projects, wildlife, indigenous } = layerVisibility;

  const markerGeoJSON = convertToGeoJSON(markers);

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

    /*
      If there is no auth token for the terrain, catch the error.
      Otherwise the rest of the layers will not load.
     */
    try {
      map.setTerrain({ source: 'maptiler.raster-dem' });
    } catch (err) {
      console.error('Error setting terrain:', err);
    }

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
    map.addSource('markers', {
      type: 'geojson',
      data: markerGeoJSON as FeatureCollection
    });
    map.addLayer({
      id: 'markers.polygons',
      type: 'fill',
      source: 'markers',
      filter: ['==', '$type', 'Polygon'],
      layout: {
        visibility: projects[0] ? 'visible' : 'none'
      },
      paint: {
        'fill-color': 'yellow',
        'fill-opacity': 0.4
      }
    });
    map.addLayer({
      id: 'markers.lines',
      type: 'line',
      source: 'markers',
      filter: ['==', '$type', 'LineString'],
      layout: {
        visibility: projects[0] ? 'visible' : 'none'
      },
      paint: {
        'line-color': 'yellow',
        'line-width': 3
      }
    });
    map.addLayer({
      id: 'markers.points',
      type: 'circle',
      source: 'markers',
      filter: ['==', '$type', 'Point'],
      layout: {
        visibility: projects[0] ? 'visible' : 'none'
      },
      paint: {
        'circle-color': 'yellow',
        'circle-radius': 5
      }
    });
    /* Add the popup */
    map.on('click', 'markers.polygons', (e: any) => {
      const prop = e.features![0].properties;

      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<div>${prop.name}</div>`)
        .addTo(map);
    });
    map.on('mousemove', 'markers.polygons', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'markers.polygons', () => {
      map.getCanvas().style.cursor = '';
    });

    /* Add popup for the lines */
    map.on('click', 'markers.lines', (e: any) => {
      const prop = e.features![0].properties;

      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<div>${prop.name}</div>`)
        .addTo(map);
    });
    map.on('mousemove', 'markers.lines', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'markers.lines', () => {
      map.getCanvas().style.cursor = '';
    });

    /* Add popup for the points */
    map.on('click', 'markers.points', (e: any) => {
      const prop = e.features![0].properties;

      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<div>${prop.name}</div>`)
        .addTo(map);
    });
    map.on('mousemove', 'markers.points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'markers.points', () => {
      map.getCanvas().style.cursor = '';
    });
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
const checkLayerVisibility = (layers: any) => {
  if (!map) return; // Exist if map is not initialized

  Object.keys(layers).forEach((layer) => {
    // The boundary layer is simple enough.
    if (layer === 'boundary' && map.getLayer('ne_boundary')) {
      map.setLayoutProperty(
        'ne_boundary',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
    }

    // Wells is a group of three different point layers
    if (
      layer === 'wells' &&
      map.getLayer('orphanedWellsLayer') &&
      map.getLayer('orphanedActivitiesLayer') &&
      map.getLayer('surfaceStateLayer')
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
      map.setLayoutProperty(
        'surfaceStateLayer',
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

    // Projects and plans can have three separate geometry types
    if (
      layer === 'projects' &&
      map.getLayer('markers.polygons') &&
      map.getLayer('markers.lines') &&
      map.getLayer('markers.points')
    ) {
      map.setLayoutProperty(
        'markers.polygons',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
      map.setLayoutProperty(
        'markers.lines',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
      map.setLayoutProperty(
        'markers.points',
        'visibility',
        layers[layer][0] ? 'visible' : 'none'
      );
    }
  });
};

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { mapId, center, zoom, markers, layerVisibility } = props;

  // Update the map if the markers change
  useEffect(() => {
    initializeMap(mapId, center, zoom, markers, layerVisibility);
  }, [markers]);

  // Listen to layer changes
  useEffect(() => {
    checkLayerVisibility(layerVisibility);
  }, [layerVisibility]);

  return <div id={mapId} style={pageStyle}></div>;
};

export default MapContainer;
