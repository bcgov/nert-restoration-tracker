import React from 'react';

export interface IMapState {
  layerVisibility: {
    boundary: boolean;
    orphanedWells: boolean;
    projects: boolean;
    plans: boolean;
    protectedAreas: boolean;
    seismic: boolean;
    baselayer: string;
  };
}
export const layerVisibilityDefault = {
  boundary: true,
  orphanedWells: false,
  projects: false,
  plans: true,
  protectedAreas: true,
  seismic: false,
  baselayer: 'hybrid'
};

export const MapStateContext = React.createContext<IMapState>({
  layerVisibility: layerVisibilityDefault
});

export const MapStateContextProvider: React.FC<React.PropsWithChildren> = (props) => {
  const mapState: IMapState = {
    layerVisibility: layerVisibilityDefault
  };

  return <MapStateContext.Provider value={mapState}>{props.children}</MapStateContext.Provider>;
};
