import { Box } from '@mui/system';
import { MapStateContext } from 'contexts/mapContext';
import { Feature } from 'geojson';
import 'leaflet/dist/leaflet.css';
import React, { useContext, useEffect } from 'react';
import MapFeatureList from './MapFeatureList';
import { initializeMap } from 'utils/mapUtils';
import { IMarker } from './components/MarkerCluster';

export interface IMapContainerProps {
  mapId: string;
  features: Feature[];
  markers?: IMarker[];
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { mapId, features, markers } = props;

  const mapContext = useContext(MapStateContext);
  const { tooltipHandler } = mapContext;

  const centroids = Boolean(markers);

  // Update the map if the features change
  useEffect(() => {
    initializeMap(
      mapId,
      mapContext.zoom,
      features,
      mapContext.layerVisibility,
      mapContext.markerHandler,
      mapContext.activeFeatureState,
      mapContext.tooltipHandler,
      mapContext.center,
      centroids,
      markers || []
    );
  }, [features]);

  return (
    <>
      <Box className="feature-box">
        <MapFeatureList features={features} />
      </Box>

      <Box height={500}>
        <div
          id={mapId}
          style={{
            width: '100%',
            height: '100%'
          }}>
          <div
            id="tooltip"
            className={tooltipHandler.tooltipVisibleState[0] ? 'visible' : 'tooltip'}
            style={{
              left: tooltipHandler.tooltipXYState[0][0],
              top: tooltipHandler.tooltipXYState[0][1]
            }}>
            {tooltipHandler.tooltipInfo[0]}
          </div>
        </div>
      </Box>
    </>
  );
};

export default MapContainer;
