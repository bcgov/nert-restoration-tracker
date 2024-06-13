import React from 'react';

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
    const [boundary, setBoundary] = React.useState<boolean>(init.boundary);
    const [wells, setWells] = React.useState<boolean>(init.wells);
    const [projects, setProjects] = React.useState<boolean>(init.projects);
    const [plans, setPlans] = React.useState<boolean>(init.plans);
    const [wildlife, setWildlife] = React.useState<boolean>(init.wildlife);
    const [indigenous, setIndigenous] = React.useState<boolean>(init.indigenous);
    const [baselayer, setBaselayer] = React.useState<string>(init.baselayer);

    this.boundary = [boundary, setBoundary];
    this.wells = [wells, setWells];
    this.projects = [projects, setProjects];
    this.plans = [plans, setPlans];
    this.wildlife = [wildlife, setWildlife];
    this.indigenous = [indigenous, setIndigenous];
    this.baselayer = [baselayer, setBaselayer];
  }
}

export interface IMapState {
  layerVisibility: ILayerVisibility;
  setVisibility: (visibility: ILayerVisibilityDefaultValues) => void;
}

export const MapStateContext = React.createContext<IMapState>({
  layerVisibility: {} as unknown as ILayerVisibility,
  setVisibility: () => {}
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

  const mapState: IMapState = {
    layerVisibility,
    setVisibility
  };

  return <MapStateContext.Provider value={mapState}>{props.children}</MapStateContext.Provider>;
};
