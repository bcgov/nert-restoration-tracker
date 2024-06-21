import { Box } from '@mui/system';
import { MapStateContext } from 'contexts/mapContext';
import { Feature } from 'geojson';
import 'leaflet/dist/leaflet.css';
import React, { useContext, useEffect } from 'react';
import { IMarker } from './components/MarkerCluster';
import LayerSwitcher from './components/LayerSwitcher';
import 'maplibre-gl/dist/maplibre-gl.css';
import './mapContainer2Style.css'; // Custom styling
import { LayerVisibility, layerVisibilityDefaultValues, ToolTipHandler } from 'models/maps';

export interface IMapContainerProps {
  mapId: string;
  layerSwitcher: boolean;
  features: Feature[];
  markers?: IMarker[];
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { mapId, features, markers } = props;

  const mapContext = useContext(MapStateContext);
  const tooltipHandler = new ToolTipHandler();
  const layerVisibility = new LayerVisibility(layerVisibilityDefaultValues);

  useEffect(() => {
    if (!mapContext.map) {
      mapContext.initMap();
    }

    mapContext.updateMap(features, markers);
  }, [features, markers, mapContext, tooltipHandler, layerVisibility]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        id={mapId}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}>
        <div
          id={`${mapId}-tooltip}`}
          className={tooltipHandler.tooltipVisibleState[0] ? 'visible' : 'tooltip'}
          style={{
            left: tooltipHandler.tooltipXYState[0][0],
            top: tooltipHandler.tooltipXYState[0][1]
          }}>
          {tooltipHandler.tooltipInfo[0]}
        </div>
      </div>
      {/* LayerSwitcher component is optional */}
      {props.layerSwitcher && <LayerSwitcher layerVisibility={layerVisibility} />}
    </Box>
  );
};

export default MapContainer;
