import Box from '@mui/material/Box';
import * as turf from '@turf/turf';
import centroid from '@turf/centroid';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import LayerSwitcher from 'components/map/components/LayerSwitcher';
import MapContainer from 'components/map/MapContainer';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useNertApi } from 'hooks/useNertApi';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import ne_boundary from 'components/map/layers/north_east_boundary.json';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';

// This may or may not be used
const projectBoundary = turf.bbox(ne_boundary);

/**
 * Page to search for and display a list of records spatially.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const restorationApi = useNertApi();

  const [performSearch, setPerformSearch] = useState<boolean>(true);
  const [geometries, setGeometries] = useState([]);

  const authStateContext = useAuthStateContext();

  type LatLngTuple = [number, number, number?];
  const dialogContext = useContext(DialogContext);

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
      const response = authStateContext.nertUserWrapper.hasOneOrMoreProjectRoles
        ? await restorationApi.search.getSearchResults()
        : await restorationApi.public.search.getSearchResults();

      if (!response) {
        setPerformSearch(false);
        return;
      }

      const clusteredPointGeometries: any = [];

      response.forEach((result: any) => {
        const feature = generateValidGeometryCollection(result.geometry, result.id)
          .geometryCollection[0];

        clusteredPointGeometries.push({
          position: centroid(feature as any).geometry.coordinates as LatLngTuple,
          feature: result
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
  }, [restorationApi.search, restorationApi.public.search, authStateContext.auth]);

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

  /**
   * Displays search results visualized on a map spatially.
   */
  return (
    <Box sx={{ height: '100%' }}>
      <MapContainer
        mapId="search_boundary_map"
        features={geometries}
        layerVisibility={layerVisibility}
        // bounds={projectBoundary}
        centroids={true}
      />
      <LayerSwitcher layerVisibility={layerVisibility} open={true} />
    </Box>
  );
};

export default SearchPage;
