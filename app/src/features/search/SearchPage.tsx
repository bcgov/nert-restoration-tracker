import Box from '@mui/material/Box';
import centroid from '@turf/centroid';
import { IMarker } from 'components/map/components/MarkerCluster';
import { SearchFeaturePopup } from 'components/map/components/SearchFeaturePopup';
import { AuthStateContext } from 'contexts/authStateContext';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { LatLngTuple } from 'leaflet';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { isAuthenticated } from 'utils/authUtils';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';
import { IGetSearchResultsResponse } from 'interfaces/useSearchApi.interface';
import { Feature } from '@turf/turf';
import MapContainer from 'components/map/MapContainer';
import { MapStateContextProvider } from 'contexts/mapContext';
import { LngLatLike } from 'maplibre-gl';

/**
 * Page to search for and display a list of records spatially.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const restorationApi = useRestorationTrackerApi();

  const [performSearch, setPerformSearch] = useState<boolean>(true);
  const [geometries, setGeometries] = useState<IMarker[]>([]);

  const { keycloakWrapper } = useContext(AuthStateContext);

  const getSearchResults = useCallback(async () => {
    try {
      const response = isAuthenticated(keycloakWrapper)
        ? await restorationApi.search.getSearchResults()
        : await restorationApi.public.search.getSearchResults();

      if (!response) {
        setPerformSearch(false);
        return;
      }

      const clusteredPointGeometries: IMarker[] = [];

      response.forEach((result: IGetSearchResultsResponse) => {
        const feature = generateValidGeometryCollection(result.geometry, result.id)
          .geometryCollection[0];

        clusteredPointGeometries.push({
          position: centroid(feature as Feature).geometry.coordinates as LatLngTuple,
          popup: <SearchFeaturePopup featureData={result} />
        });
      });

      setPerformSearch(false);
      setGeometries(clusteredPointGeometries);
    } catch (error) {
      const apiError = error as APIError;
      console.log('apiError', apiError);
      // showFilterErrorDialog({
      //   dialogTitle: 'Error Searching For Results',
      //   dialogError: apiError?.message,
      //   dialogErrorDetails: apiError?.errors
      // });
    }
  }, [restorationApi.search, restorationApi.public.search, keycloakWrapper]);

  useEffect(() => {
    if (performSearch) {
      getSearchResults();
    }
  }, [performSearch, getSearchResults]);

  /**
   * Displays search results visualized on a map spatially.
   */
  return (
    <Box sx={{ height: '100%' }}>
      <MapStateContextProvider
        mapId="search_boundary_map"
        center={[-124, 57] as LngLatLike}
        zoom={6}>
        <MapContainer
          mapId="search_boundary_map"
          layerSwitcher={true}
          features={[]}
          markers={geometries}
        />
      </MapStateContextProvider>
    </Box>
  );
};

export default SearchPage;
