import { Feature } from 'geojson';
import { LngLatLike } from 'maplibre-gl';
import {
  ILayerVisibility,
  ILayerVisibilityDefaultValues,
  IMarkerState,
  IMaskState,
  IToolTipState,
  IUseState,
  LayerVisibility,
  layerVisibilityDefaultValues,
  MarkerHandler,
  MaskHandler,
  ToolTipHandler
} from 'models/maps';
import React, { useState } from 'react';
import * as maplibre from 'maplibre-gl';
import { rerenderMap } from 'utils/mapUtils';
import { IMarker } from 'components/map/components/MarkerCluster';

export interface IMapState {
  layerVisibility: ILayerVisibility;
  setVisibility: (visibility: ILayerVisibilityDefaultValues) => void;
  tooltipHandler: IToolTipState;
  markerHandler: IMarkerState;
  maskHandler: IMaskState;
  activeFeatureState: IUseState<number | undefined>;
  map: maplibre.Map | undefined;
  initMap: () => void;
  updateMap: (features: Feature[], markers?: IMarker[]) => void;
  features?: Feature[];
  centroids?: boolean;
}

export const MapStateContext = React.createContext<IMapState>({
  layerVisibility: {} as unknown as ILayerVisibility,
  setVisibility: () => {},
  tooltipHandler: {} as unknown as IToolTipState,
  markerHandler: {} as unknown as IMarkerState,
  maskHandler: {} as unknown as IMaskState,
  activeFeatureState: [undefined, () => {}],
  map: {} as unknown as maplibre.Map,
  initMap: () => {},
  updateMap: () => {}
});

let map: maplibre.Map;

export interface IMapStateContextProviderProps {
  children: React.ReactNode;
  mapId: string;
  center?: LngLatLike;
  zoom: number;
}

export const MapStateContextProvider: React.FC<IMapStateContextProviderProps> = (props) => {
  console.log('props', props);
  const layerVisibility = new LayerVisibility(layerVisibilityDefaultValues);

  const setVisibility = (visibility: ILayerVisibilityDefaultValues) => {
    layerVisibility.boundary[1](visibility.boundary);
    layerVisibility.wells[1](visibility.wells);
    layerVisibility.projects[1](visibility.projects);
    layerVisibility.plans[1](visibility.plans);
    layerVisibility.wildlife[1](visibility.wildlife);
    layerVisibility.indigenous[1](visibility.indigenous);
    layerVisibility.baselayer[1](visibility.baselayer);
  };

  const tooltipHandler = new ToolTipHandler();
  console.log('tooltipHandler', tooltipHandler);
  const markerHandler = new MarkerHandler();
  console.log('markerHandler', markerHandler);
  const maskHandler = new MaskHandler();
  console.log('maskHandler', maskHandler);

  const activeFeatureState = useState<number | undefined>(undefined);

  const initMap = () => {
    map = new maplibre.Map({
      container: props.mapId,
      style: '/styles/hybrid.json',
      center: props.center,
      zoom: props.zoom,
      maxPitch: 80,
      hash: 'loc',
      attributionControl: {
        compact: true,
        customAttribution: 'Powered by <a href="https://esri.com">Esri</a>'
      }
    });
  };

  const updateMap = (features: Feature[], markers?: IMarker[]) => {
    const centroids = Boolean(markers);

    rerenderMap(
      map,
      layerVisibility,
      markerHandler,
      activeFeatureState,
      tooltipHandler,
      centroids,
      features,
      markers
    );
  };

  const mapState: IMapState = {
    layerVisibility,
    setVisibility,
    tooltipHandler,
    markerHandler,
    maskHandler,
    activeFeatureState,
    map,
    initMap,
    updateMap
  };

  return <MapStateContext.Provider value={mapState}>{props.children}</MapStateContext.Provider>;
};
