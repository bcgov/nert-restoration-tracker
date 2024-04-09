import Box from '@mui/material/Box';
import centroid from '@turf/centroid';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import LayerSwitcher from 'components/map/components/LayerSwitcher';
import { IMarker } from 'components/map/components/MarkerCluster';
import MapContainer from 'components/map/MapContainer2';
import { SearchFeaturePopup } from 'components/map/SearchFeaturePopup';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { LatLngTuple } from 'leaflet';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { isAuthenticated } from 'utils/authUtils';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';

/**
 * Page to search for and display a list of records spatially.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const restorationApi = useRestorationTrackerApi();

  const [performSearch, setPerformSearch] = useState<boolean>(true);
  const [geometries, setGeometries] = useState<IMarker[]>([]);

  const dialogContext = useContext(DialogContext);
  const { keycloakWrapper } = useContext(AuthStateContext);

  const showFilterErrorDialog = useCallback(
    (textDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        ...textDialogProps,
        open: true
      });
    },
    [dialogContext]
  );

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

      response.forEach((result: any) => {
        const feature = generateValidGeometryCollection(result.geometry, result.id)
          .geometryCollection[0];

        clusteredPointGeometries.push({
          position: centroid(feature as any).geometry.coordinates as LatLngTuple,
          popup: <SearchFeaturePopup featureData={result} />
        });
      });

      setPerformSearch(false);
      setGeometries(clusteredPointGeometries);
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Searching For Results',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  }, [restorationApi.search, restorationApi.public.search, showFilterErrorDialog, keycloakWrapper]);

  useEffect(() => {
    if (performSearch) {
      getSearchResults();
    }
  }, [performSearch, getSearchResults]);

  /**
   * Reactive state to share between the layer picker and the map
   */
  const boundary = useState<boolean>(true);
  const wells = useState<boolean>(false);
  const projects = useState<boolean>(true);
  const wildlife = useState<boolean>(false);
  const indigenous = useState<boolean>(false);

  const layerVisibility = {
    boundary,
    wells,
    projects,
    wildlife,
    indigenous
  };

  /**
   * Displays search results visualized on a map spatially.
   */
  return (
    <Box sx={{ height: '100%' }}>
      <MapContainer
        mapId="search_boundary_map"
        center={[-124, 57]}
        zoom={6}
        markers={geometries}
        layerVisibility={layerVisibility}
      />
      <LayerSwitcher layerVisibility={layerVisibility} />
    </Box>
  );
};

export default SearchPage;
