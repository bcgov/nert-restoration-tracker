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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          name: f.name,
          is_project: f.is_project
        }
      };
    })
  };
  return geojson;
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

let map: maplibre.Map;

const initializeMap = (
  mapId: string,
  center: any,
  zoom: number,
  markers: any,
  layerVisibility?: any
) => {
  const { boundary, wells, projects, plans, wildlife, indigenous } = layerVisibility;

  const markerGeoJSON = convertToCentroidGeoJSON(markers);

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
    map.loadImage('/assets/icon/marker-icon.png').then((image) => {
      map.addImage('blue-marker', image.data);
    });
    map.loadImage('/assets/icon/marker-icon2.png').then((image) => {
      map.addImage('orange-marker', image.data);
    });

    map.addSource('markers', {
      type: 'geojson',
      data: markerGeoJSON as FeatureCollection,
      cluster: true,
      clusterRadius: 100
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
          <div>${name}</div>
          <div>
            <a href="/${isProject ? 'projects' : 'plans'}/${id}">
              <button style=${buttonStyle}>View</button>
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
      const html = makePopup(prop.name, prop.id, true);

      // @ts-ignore
      new Popup({ offset: { bottom: [0, -14] } }).setLngLat(e.lngLat).setHTML(html).addTo(map);
    });
    map.on('mousemove', 'markerPlans.points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'markerPlans.points', () => {
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
  const { mapId, center, zoom, markers, layerVisibility } = props;

  // Update the map if the markers change
  useEffect(() => {
    initializeMap(mapId, center, zoom, markers, layerVisibility);
  }, [markers]);

  // Listen to layer changes
  useEffect(() => {
    checkLayerVisibility(layerVisibility, convertToCentroidGeoJSON(markers));
  }, [layerVisibility]);

  return <div id={mapId} style={pageStyle}></div>;
};

export default MapContainer;
