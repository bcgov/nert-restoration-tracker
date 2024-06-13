import maplibre, { LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useState } from 'react';
import './mapContainer2Style.css';
import { ILayerVisibility } from 'contexts/mapContext';
import {
  convertToCentroidGeoJSON,
  convertToGeoJSON,
  initializeMap,
  ITooltipState
} from 'utils/mapUtils';
import { Feature, Geometry } from '@turf/turf';
import { GeoJsonProperties } from 'geojson';

export interface IMapContainerProps {
  mapId: string;
  center: LngLatLike;
  features: Feature<Geometry, GeoJsonProperties>[];
  layerVisibility: ILayerVisibility;
  zoom: number;
  centroids?: boolean;
}

const pageStyle = {
  width: '100%',
  height: '100%'
};

let map: maplibre.Map;

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
      const rasterSource = currentStyle.sources['raster-tiles'] as maplibre.RasterTileSource;
      const currentBase = rasterSource.tiles[0];

      if (!Object.hasOwn(baseLayerUrls, layers.baselayer[0])) return;
      const newBase: string = baseLayerUrls[layers.baselayer[0]];

      if (currentBase !== newBase) {
        currentStyle.sources['raster-tiles'] = [] as any;
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

  const [activeFeatureState, setActiveFeatureState] = useState<number | null>(null);

  // Tooltip variables
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<HTMLDivElement | null>(null);
  const [tooltipX, setTooltipX] = useState<number>(0);
  const [tooltipY, setTooltipY] = useState<number>(0);

  // Package the tooltip state to pass to the map
  const tooltipState: ITooltipState = {
    tooltip,
    setTooltip,
    tooltipVisible,
    setTooltipVisible,
    tooltipX,
    setTooltipX,
    tooltipY,
    setTooltipY
  };

  const [projectMarker, setProjectMarker] = useState<HTMLImageElement | ImageBitmap>();
  const [planMarker, setPlanMarker] = useState<HTMLImageElement | ImageBitmap>();

  const markerState = {
    projectMarker,
    setProjectMarker,
    planMarker,
    setPlanMarker
  };

  // Update the map if the features change
  useEffect(() => {
    initializeMap(
      mapId,
      zoom,
      features,
      layerVisibility,
      markerState,
      [activeFeatureState, setActiveFeatureState],
      tooltipState,
      center,
      centroids
    );
  }, [features]);

  // Listen to layer changes
  useEffect(() => {
    if (centroids) {
      checkLayerVisibility(layerVisibility, convertToCentroidGeoJSON(features));
    } else {
      checkLayerVisibility(layerVisibility, convertToGeoJSON(features));
    }
  }, [layerVisibility, projectMarker, planMarker]);

  return (
    <div id={mapId} style={pageStyle}>
      <div
        id="tooltip"
        className={tooltipVisible ? 'visible' : 'tooltip'}
        style={{ left: tooltipX, top: tooltipY }}
        ref={tooltip}></div>
    </div>
  );
};

export default MapContainer;
