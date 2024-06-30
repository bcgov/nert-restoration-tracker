import Box from '@mui/material/Box';
import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import MapContainer from 'components/map/MapContainer2';
import { IGetProjectForViewResponseLocation } from 'interfaces/useProjectApi.interface';
import { LatLngBoundsExpression } from 'leaflet';
import React, { useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

const pageStyles = {
  mapContainer: {
    '& dl': {
      marginBottom: 0
    },
    '& dl div + div': {
      marginTop: '0.5rem'
    },
    '& dd, dt': {
      display: 'inline-block',
      verticalAlign: 'top'
    },
    '& dt': {
      width: '40%'
    },
    '& dd': {
      width: '60%'
    },
    '& dd span': {
      display: 'inline'
    },
    '& ul': {
      border: '1px solid #ccccccc',
      borderRadius: '4px'
    }
  }
};

export interface ILocationBoundaryProps {
  locationData: IGetProjectForViewResponseLocation;
  scrollWheelZoom?: boolean;
}

/**
 * Location boundary content for a project or plan.
 *
 * @return {*}
 */
const LocationBoundary: React.FC<ILocationBoundaryProps> = (props) => {
  const { locationData } = props;

    const locationFeatures: IStaticLayerFeature[] = locationData.geometry.map((item) => {
      return { geoJSON: item, GeoJSONProps: { style: { fillOpacity: 0.1, weight: 2 } } };
    });

    const bounds = calculateUpdatedMapBounds([...locationFeatures].map((item) => item.geoJSON),true);

  /**
   * Reactive state to share between the layer picker and the map
   */
  const boundary = useState<boolean>(true);
  const wells = useState<boolean>(false);
  const projects = useState<boolean>(true);
  const plans = useState<boolean>(true);
  const wildlife = useState<boolean>(false);
  const indigenous = useState<boolean>(false);
  const baselayer = useState<string>('hybrid');

  const layerVisibility = {
    boundary,
    wells,
    projects,
    plans,
    wildlife,
    indigenous,
    baselayer
  };

  return (
    <Box
      width="100%"
      height="100%"
      overflow="hidden"
      data-testid="map_container"
      sx={pageStyles.mapContainer}>
      <MapContainer
        mapId="project_location_form_map"
        features={locationData.geometry}
        bounds={bounds}
        layerVisibility={layerVisibility}
      />
    </Box>
  );
};

export default LocationBoundary;
