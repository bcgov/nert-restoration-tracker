import maplibre, { Popup } from 'maplibre-gl';
import {
  initMapActivitiesLayer,
  initMapActivitiesSource,
  initMapWellLayer,
  initMapWellSource
} from 'constants/map';
import { ILayerVisibility, IUseState } from 'contexts/mapContext';
import { checkFeatureState, IMarkerState, ITooltipState } from './mapUtils';

/**
 * # addMapSource - Add a source to the map
 *
 * @param {maplibre.Map} map
 * @param {string} sourceName
 * @param {maplibre.SourceSpecification} source
 */
export const addMapSource = (
  map: maplibre.Map,
  sourceName: string,
  source: maplibre.SourceSpecification
) => {
  map.addSource(sourceName, source);
};

/**
 * # addMapLayer - Add a layer to the map
 *
 * @param {maplibre.Map} map
 * @param {maplibre.LayerSpecification} layer
 * @param {string} [beforeLayer]
 */
export const addMapLayer = (
  map: maplibre.Map,
  layer: maplibre.LayerSpecification,
  beforeLayer?: string
) => {
  map.addLayer(layer, beforeLayer);
};

/**
 * This function draws the wells on the map
 * @param map - the map object
 *
 * @param {maplibre.Map} map
 * @param {boolean} wells
 */
export const drawWells = (map: maplibre.Map, layerVisibility: ILayerVisibility) => {
  addMapSource(map, 'orphanedWells', initMapWellSource());
  addMapLayer(map, initMapWellLayer(layerVisibility.wells));

  //Orphaned activities - These are called "Activities" on the BCER site
  addMapSource(map, 'orphanedActivities', initMapActivitiesSource());
  addMapLayer(map, initMapActivitiesLayer(layerVisibility.wells));
};

/**
 *  This function handles the loading of the images for the markers
 *
 * @param {maplibre.Map} map
 * @param {IMarkerState} markerState
 * @return {*}  {Promise<void>}
 */
export const handleLoadImages = async (
  map: maplibre.Map,
  markerState: IMarkerState
): Promise<void> => {
  /**
   * This is to work around an async quirk in maplibre-gl.
   * Use React hooks to force maplibre to refresh the plans and projects
   * layers once the images are loaded. This only seems to be a thing with
   * image icons styling for geojson points.
   */
  const projectMarkerFile = await map.loadImage('/assets/icon/marker-icon.png');
  markerState?.setProjectMarker(projectMarkerFile.data);
  map.addImage('blue-marker', projectMarkerFile.data);

  const planMarkerFile = await map.loadImage('/assets/icon/marker-icon2.png');
  markerState?.setPlanMarker(planMarkerFile.data);
  map.addImage('orange-marker', planMarkerFile.data);
};

/**
 * This function handles the hover over polygons
 *
 * @param {maplibre.Map} map
 * @param {(IUseState<number | null>)} activeFeatureState
 */
export const handleHoverPolygons = (
  map: maplibre.Map,
  activeFeatureState: IUseState<number | null>
) => {
  // Hover over polygons
  map
    .on('mouseenter', 'markerPolygon', (e: any) => {
      map.getCanvas().style.cursor = 'pointer';

      checkFeatureState(map, activeFeatureState);
      activeFeatureState[1](e.features[0].id);
    })
    .on('mouseleave', 'markerPolygon', () => {
      map.getCanvas().style.cursor = '';

      activeFeatureState[1](null);
    });
};

/**
 *  This function handles the click on a cluster
 *
 * @param {maplibre.Map} map
 */
export const handleClusterClick = (map: maplibre.Map) => {
  // Click on a cluster
  map.on('click', 'markerClusters.points', (e: any) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const clusterId = e.features[0].properties.cluster_id;

    // @ts-ignore
    map
      .getSource('markers')
      // @ts-ignore
      .getClusterExpansionZoom(clusterId)
      .then((zoom: number) => {
        map.easeTo({
          center: coordinates,
          zoom: zoom
        });
      });
  });
};

/**
 * This function handles the mouse move on the projects
 *
 * @param {maplibre.Map} map
 */
export const handleMouseMove = (map: maplibre.Map) => {
  map.on('mousemove', 'markerProjects.points', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'markerProjects.points', () => {
    map.getCanvas().style.cursor = '';
  });
};

/**
 * This function handles the tooltip on the map
 *
 * @param {maplibre.Map} map
 */
export const handleTooltip = (map: maplibre.Map, tooltipState: ITooltipState) => {
  let hoverStatePlans: any = false;
  const showTooltip = (e: any) => {
    map.getCanvas().style.cursor = 'pointer';

    tooltipState.setTooltipVisible(true);

    /**
     * Calculate the coordinates of the tooltip based on
     * the mouse position and icon size
     */
    const coordinates = e.features[0].geometry.coordinates;
    const location = map.project(coordinates);
    tooltipState.setTooltipX(location.x + 10);
    tooltipState.setTooltipY(location.y - 34);
    tooltipState.setTooltip(e.features[0].properties.name);

    if (hoverStatePlans !== false) {
      map.setFeatureState(
        {
          source: 'markers',
          id: hoverStatePlans
        },
        { hover: true }
      );
    }

    // Geometry state
    hoverStatePlans = e.features[0].id;
    map.setFeatureState(
      {
        source: 'markers',
        id: hoverStatePlans
      },
      { hover: true }
    );
  };

  const hideTooltip = () => {
    map.getCanvas().style.cursor = '';
    tooltipState.setTooltipVisible(false);
    tooltipState.setTooltip(null);
  };

  // Hover over the plans
  map.on('mouseenter', 'markerPlans.points', showTooltip);
  map.on('mouseleave', 'markerPlans.points', hideTooltip);

  // Hover over the projects
  map.on('mouseenter', 'markerProjects.points', showTooltip);
  map.on('mouseleave', 'markerProjects.points', hideTooltip);
};

/**
 * This function handles the click on a project popup
 *
 * @param {maplibre.Map} map
 */
export const handleAddProjectPopup = (map: maplibre.Map) => {
  /* Add popup for the points */
  map.on('click', 'markerProjects.points', (e: any) => {
    const prop = e.features[0].properties;

    const html = makePopup(prop.name, prop.id, true);

    new Popup({ offset: { bottom: [0, -14] } as maplibre.Offset })
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);
  });
};

/**
 * This function handles the click on a plan popup
 *
 * @param {maplibre.Map} map
 */
export const handleAddPlanPopup = (map: maplibre.Map) => {
  /* Add popup for the points */
  map.on('click', 'markerPlans.points', (e: any) => {
    const prop = e.features[0].properties;

    // TBD: Currently the /plans route is not available
    // const html = makePopup(prop.name, prop.id, false);
    const html = makePopup(prop.name, prop.id, false);

    new Popup({ offset: { bottom: [0, -14] } as maplibre.Offset })
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);
  });
};

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
          <div>${isProject ? 'Project' : 'Plan'} Name: <b>${name}</b></div>
          <div class="view-btn">
            <a href="/${isProject ? 'projects' : 'plans'}/${id}" >
              <button style=${buttonStyle} title="Take me to the details page">View Project Details</button>
            </a>
          </div>
        </div>`;
};
