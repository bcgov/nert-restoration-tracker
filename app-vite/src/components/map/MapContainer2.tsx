import { Feature } from "geojson";
import React, { useEffect } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ne_boundary from "./layers/north_east_boundary.json";

export interface IMapDrawControlsProps {
  features?: Feature[];
  onChange?: (ref: any) => void;
}

export interface IMapContainerProps {
  mapId: string;
  center?: any;
  zoom?: any;
}

let map: maplibre.Map;

const initializeMap = (mapId: string, center: any, zoom: number) => {
  map = new maplibre.Map({
    container: mapId,
    style: "/styles/ortho.json",
    center: center,
    zoom: zoom,
    maxPitch: 80,
    hash: "loc",
    attributionControl: {
      compact: true,
      customAttribution: 'Powered by <a href="https://esri.com">Esri</a>',
    },
  });
};

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { mapId, center, zoom } = props;

  useEffect(() => {
    initializeMap(mapId, center, zoom);
  });
  return <div id={mapId}></div>;
};

export default MapContainer;
