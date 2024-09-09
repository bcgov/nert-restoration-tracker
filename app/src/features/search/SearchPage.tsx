import Box from '@mui/material/Box';
import centroid from '@turf/centroid';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import LayerSwitcher from 'components/map/components/LayerSwitcher';
import LayerSwitcherInline from 'components/map/components/LayerSwitcherInline';
import { IconButton } from '@mui/material';
import MapContainer from 'components/map/MapContainer';
import SideBar from 'components/map/components/SideBar';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useNertApi } from 'hooks/useNertApi';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';
import ArrowBack from '@mui/icons-material/ArrowBack';
import LayersIcon from '@mui/icons-material/Layers';

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

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // setTimeout(() => {
  //   setSidebarOpen(false);
  // },3000);

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

  const sidebarButtonStyle = {
    position: 'absolute',
    top: '40px',
    left: sidebarOpen ? '260px' : '0px',
    zIndex: 1000,
    backgroundColor: 'white',
    transition: 'left 225ms cubic-bezier(0, 0, 0.2, 1)',
    ':hover': {
      transform: 'scale(1.1)',
      backgroundColor: 'white',
    },
    borderRadius: '0 20% 20% 0',
  };

  /**
   * Displays search results visualized on a map spatially.
   */
  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <MapContainer
        mapId="search_boundary_map"
        features={geometries}
        layerVisibility={layerVisibility}
        centroids={true}>
        <SideBar sidebarOpen={sidebarOpen}>
          <LayerSwitcherInline layerVisibility={layerVisibility} />
        </SideBar>

        {/* button that opens and closes the sidebar */}
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={sidebarButtonStyle}>
          {sidebarOpen ? <ArrowBack /> : <LayersIcon />}
        </IconButton>

      </MapContainer>
      <LayerSwitcher layerVisibility={layerVisibility} open={true} />
    </Box>
  );
};

export default SearchPage;
