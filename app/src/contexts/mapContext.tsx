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

export interface IMapState {
  layerVisibility: ILayerVisibility;
  setVisibility: (visibility: ILayerVisibilityDefaultValues) => void;
  tooltipHandler: IToolTipState;
  markerHandler: IMarkerState;
  maskHandler: IMaskState;
  activeFeatureState: IUseState<number | undefined>;
  zoom: number;
  center?: LngLatLike;
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
  zoom: 6
});

export const MapStateContextProvider: React.FC<React.PropsWithChildren> = (props) => {
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
  const markerHandler = new MarkerHandler();
  const maskHandler = new MaskHandler();

  const activeFeatureState = useState<number | undefined>(undefined);

  const mapState: IMapState = {
    layerVisibility,
    setVisibility,
    tooltipHandler,
    markerHandler,
    maskHandler,
    activeFeatureState,
    center: [-124, 57],
    zoom: 6
  };

  return <MapStateContext.Provider value={mapState}>{props.children}</MapStateContext.Provider>;
};
