import { FeatureCollection } from "geojson";
import React, { useEffect } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ne_boundary from "./layers/north_east_boundary.json";

export interface IMapDrawControlsProps {
  features?: FeatureCollection[];
  onChange?: (ref: any) => void;
}

export interface IMapContainerProps {
  mapId: string;
  center?: any;
  zoom?: any;
}

// Typescript needs this to be declared
declare const MAPTILER_API_KEY: string;

const pageStyle = {
  width: "100%",
  height: "100%",
};

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
  map.on("load", () => {
    /* The base layer */
    map.addSource("maptiler.raster-dem", {
      type: "raster-dem",
      url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_API_KEY}`,
    });
    map.setTerrain({ source: "maptiler.raster-dem" });

    /* The boundary layer */
    map.addSource("ne_boundary", {
      type: "geojson",
      data: ne_boundary as FeatureCollection,
    });
    map.addLayer({
      id: "ne_boundary",
      type: "line",
      source: "ne_boundary",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "yellow",
        "line-width": 2,
      },
    });
  });
};

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { mapId, center, zoom } = props;

  useEffect(() => {
    initializeMap(mapId, center, zoom);
  });
  return <div id={mapId} style={pageStyle}></div>;
};

export default MapContainer;
