import { FeatureCollection } from "geojson";
import React, { useEffect } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ne_boundary from "./layers/north_east_boundary.json";

const { Map, Popup, NavigationControl } = maplibre;

/* The following are the URLs to the geojson data */
const orphanedWellsURL =
  "https://geoweb-ags.bc-er.ca/arcgis/rest/services/OPERATIONAL/ORPHAN_WELL_PT/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";
const orphanedActivitiesURL =
  "https://geoweb-ags.bc-er.ca/arcgis/rest/services/OPERATIONAL/ORPHAN_ACTIVITY_PT/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";
const surfaceStateURL =
  "https://geoweb-ags.bc-er.ca/arcgis/rest/services/PASR/PASR_WELL_SURFACE_STATE_PT/MapServer/0/query?outFields=*&where=1%3D1&f=geojson";

// console.log("orphanedWells", orphanedWells);

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

/* The following are objects that will store the geojson data */
let orphanedWells: FeatureCollection | null = null;
let orphanedActivites: FeatureCollection | null = null;
let surfaceState: FeatureCollection | null = null;

/* Fetch the geojson data */
fetch(orphanedWellsURL)
  .then((res) => res.json())
  .then((data) => (orphanedWells = data));
fetch(orphanedActivitiesURL)
  .then((res) => res.json())
  .then((data) => (orphanedActivites = data));
fetch(surfaceStateURL)
  .then((res) => res.json())
  .then((data) => (surfaceState = data));

const pageStyle = {
  width: "100%",
  height: "100%",
};

let map: maplibre.Map;

const initializeMap = (mapId: string, center: any, zoom: number) => {
  map = new Map({
    container: mapId,
    style: "/styles/hybrid.json",
    center: center,
    zoom: zoom,
    maxPitch: 80,
    hash: "loc",
    attributionControl: {
      compact: true,
      customAttribution: 'Powered by <a href="https://esri.com">Esri</a>',
    },
  });

  map.addControl(
    new NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    })
  );

  map.on("load", () => {
    // TODO: Can I put these in a hook?
    // map.addSource("orphanedWells", {
    //   type: "geojson",
    //   data: orphanedWells,
    // });
    // map.addLayer({
    //   id: "orphanedWells",
    //   type: "circle",
    //   source: "orphanedWells",
    //   paint: {
    //     "circle-radius": 5,
    //     "circle-color": "red",
    //     "circle-opacity": 0.5,
    //   },
    // });
    // map.addSource("orphanedActivites", {
    //   type: "geojson",
    //   data: orphanedActivites,
    // });
    // map.addLayer({
    //   id: "orphanedActivites",
    //   type: "circle",
    //   source: "orphanedActivites",
    //   paint: {
    //     "circle-radius": 5,
    //     "circle-color": "blue",
    //     "circle-opacity": 0.5,
    //   },
    // });
    // map.addSource("surfaceState", {
    //   type: "geojson",
    //   data: surfaceState,
    // });
    // map.addLayer({
    //   id: "surfaceState",
    //   type: "circle",
    //   source: "surfaceState",
    //   paint: {
    //     "circle-radius": 5,
    //     "circle-color": "green",
    //     "circle-opacity": 0.5,
    //   },
    // });

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

    /* Protected Areas as WMS layers from the BCGW */
    map.addSource("wildlife-areas", {
      type: "raster",
      tiles: [
        "https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_WILDLIFE_MANAGEMENT.WCP_UNGULATE_WINTER_RANGE_SP,WHSE_WILDLIFE_MANAGEMENT.WCP_WILDLIFE_HABITAT_AREA_POLY",
      ],
      tileSize: 256,
      minzoom: 10,
    });
    map.addLayer({
      id: "wms-wildlife-areas",
      type: "raster",
      source: "wildlife-areas",
      paint: {
        "raster-opacity": 0.5,
      },
    });

    /* Indigenous Areas as WMS layers from the BCGW */
    map.addSource("indigenous-areas", {
      type: "raster",
      tiles: [
        "https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_TANTALIS.TA_MGMT_AREAS_SPATIAL_SVW,WHSE_ADMIN_BOUNDARIES.CLAB_INDIAN_RESERVES",
      ],
      tileSize: 256,
      minzoom: 4,
    });
    map.addLayer({
      id: "wms-indigenous-areas",
      type: "raster",
      source: "indigenous-areas",
      paint: {
        "raster-opacity": 0.5,
      },
    });
  });
};

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { mapId, center, zoom } = props;

  useEffect(() => {
    initializeMap(mapId, center, zoom);
  });

  useEffect(() => {
    console.log("surfaceState", surfaceState);
  }, [surfaceState, map]);

  return <div id={mapId} style={pageStyle}></div>;
};

export default MapContainer;
