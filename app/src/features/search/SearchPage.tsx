import Box from '@mui/material/Box';
import centroid from '@turf/centroid';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
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
import { getStateCodeFromLabel, states } from 'components/workflow/StateMachine';
import { Feature } from 'geojson';
import { IGetSearchResultsResponse } from 'interfaces/useSearchApi.interface';
import { AllGeoJSON } from '@turf/turf';
import { hasAtLeastOneValidValue } from 'utils/authUtils';
import { SYSTEM_ROLE } from 'constants/roles';

/**
 * Page to search for and display a list of records spatially.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const restorationApi = useNertApi();

  const [performSearch, setPerformSearch] = useState<boolean>(true);
  const [geometries, setGeometries] = useState<Feature[]>([]);

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
  const archCode = getStateCodeFromLabel(states.ARCHIVED);
  const getSearchResults = useCallback(async () => {
    try {
      const hasSystemRole = hasAtLeastOneValidValue(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER, SYSTEM_ROLE.PROJECT_CREATOR],
        authStateContext.nertUserWrapper.roleNames
      );

      const response = hasSystemRole
        ? await restorationApi.search.getSearchResults()
        : await restorationApi.public.search.getSearchResults();

      if (!response) {
        setPerformSearch(false);
        return;
      }

      const clusteredPointGeometries: any = [];

      response.forEach((result: IGetSearchResultsResponse) => {
        const feature = generateValidGeometryCollection(result.geometry, result.id)
          .geometryCollection[0];

        // Filter out archived projects/plans
        if (archCode != result.state_code) {
          const centroidFeature = centroid(feature as AllGeoJSON);

          if (centroidFeature && centroidFeature.geometry && centroidFeature.geometry.coordinates) {
            clusteredPointGeometries.push({
              position: centroidFeature.geometry.coordinates as LatLngTuple,
              feature: result
            });
          }
        }
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

  /**
   * Reactive state to share between the layer picker and the map
   */
  const boundary = useState<boolean>(true);
  const orphanedWells = useState<boolean>(false);
  const dormantWells = useState<boolean>(false);
  const projects = useState<boolean>(true);
  const plans = useState<boolean>(true);
  const protectedAreas = useState<boolean>(false);
  const seismic = useState<boolean>(false);
  const baselayer = useState<string>('hybrid');

  const layerVisibility = {
    boundary,
    orphanedWells,
    dormantWells,
    projects,
    plans,
    protectedAreas,
    seismic,
    baselayer
  };

  const legend = {
    protectedAreas: [
      { label: 'Provincial or Federal Park', visible: true, allowToggle: false, color: '#B8D797' },
      { label: 'Provincial Conservancy', visible: true, allowToggle: false, color: '#cce4cc' },
      {
        label: 'Wildlife Habitat Area',
        visible: true,
        allowToggle: false,
        color: '#f3e5c0',
        outlineColor: '#f9766f'
      },
      {
        label: 'MUSKWA-KECHIKA Management Area',
        visible: true,
        allowToggle: false,
        color: '#e4c1bb',
        outlineColor: '#b4aaa3'
      },
      {
        label: 'Ungulate Winter Range',
        visible: true,
        allowToggle: false,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/icon-uwr.png'
      }
    ],
    boundary: [
      {
        label: 'West Coast Natural Resource Region',
        visible: true,
        allowToggle: true,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/west.png'
      },
      {
        label: 'South Coast Natural Resource Region',
        visible: true,
        allowToggle: true,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/south.png'
      },
      {
        label: 'Thompson-Okanagan Natural Resource Region',
        visible: true,
        allowToggle: true,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/thompson-okanagan.png'
      },
      {
        label: 'Kootenay-Boundary Natural Resource Region',
        visible: true,
        allowToggle: true,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/kootenay-boundary.png'
      },
      {
        label: 'Northeast Natural Resource Region',
        visible: true,
        allowToggle: true,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/northeast.png'
      },
      {
        label: 'Omineca Natural Resource Region',
        visible: true,
        allowToggle: true,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/omineca.png'
      },
      {
        label: 'Skeena Natural Resource Region',
        visible: true,
        allowToggle: true,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/skeena.png'
      },
      {
        label: 'Cariboo Natural Resource Region',
        visible: true,
        allowToggle: true,
        image: 'https://nrs.objectstore.gov.bc.ca/nerdel/images/cariboo.png'
      }
    ],
    orphanedWells: [
      { label: 'Assessed', visible: true, allowToggle: true, color: '#f0933e' },
      { label: 'Inactive', visible: true, allowToggle: true, color: '#999999' },
      { label: 'Decommissioned', visible: true, allowToggle: true, color: '#7fb2f9' },
      { label: 'Reclaimed', visible: true, allowToggle: true, color: '#adc64f' },
      {
        label: 'Deactivation',
        visible: true,
        allowToggle: true,
        outlineColor: '#fffe7d',
        color: '#ffffff'
      },
      {
        label: 'Abandonment',
        visible: true,
        allowToggle: true,
        outlineColor: '#ee212f',
        color: '#ffffff'
      },
      {
        label: 'Reclamation',
        visible: true,
        allowToggle: true,
        outlineColor: '#709958',
        color: '#ffffff'
      },
      {
        label: 'Investigation',
        visible: true,
        allowToggle: true,
        outlineColor: '#f6b858',
        color: '#ffffff'
      },
      {
        label: 'Remediation',
        visible: true,
        allowToggle: true,
        outlineColor: '#a92fe2',
        color: '#ffffff'
      },
      {
        label: 'Decommissioning',
        visible: true,
        allowToggle: true,
        outlineColor: '#4a72b5',
        color: '#ffffff'
      }
    ],
    dormantWells: [
      {
        label: 'Multiple Wells',
        visible: true,
        allowToggle: false,
        color: 'rgba(50,145,168,0.5)',
        outlineColor: 'white'
      },
      {
        label: 'Single Well',
        visible: true,
        allowToggle: false,
        color: 'rgba(255,153,0,0.8)',
        outlineColor: 'white'
      }
    ]
  };

  /**
   * Filter state to share between the layer picker and the map
   *
   */
  const boundaryState = {
    'West Coast Natural Resource Region': useState<boolean>(true),
    'South Coast Natural Resource Region': useState<boolean>(true),
    'Thompson-Okanagan Natural Resource Region': useState<boolean>(true),
    'Kootenay-Boundary Natural Resource Region': useState<boolean>(true),
    'Northeast Natural Resource Region': useState<boolean>(true),
    'Omineca Natural Resource Region': useState<boolean>(true),
    'Skeena Natural Resource Region': useState<boolean>(true),
    'Cariboo Natural Resource Region': useState<boolean>(true)
  };

  const orphanedWellsState = {
    Assessed: useState<boolean>(true),
    Inactive: useState<boolean>(true),
    Decommissioned: useState<boolean>(true),
    Reclaimed: useState<boolean>(true),
    Deactivation: useState<boolean>(true),
    Abandonment: useState<boolean>(true),
    Reclamation: useState<boolean>(true),
    Investigation: useState<boolean>(true),
    Remediation: useState<boolean>(true),
    Decommissioning: useState<boolean>(true)
  };

  const filterState = {
    boundary: boundaryState,
    orphanedWells: orphanedWellsState
  };

  const sidebarButtonStyle = {
    position: 'absolute',
    top: '40px',
    left: sidebarOpen ? '360px' : '0px',
    zIndex: 1000000,
    backgroundColor: 'white',
    transition: 'left 225ms cubic-bezier(0, 0, 0.2, 1)',
    ':hover': {
      transform: 'scale(1.1)',
      backgroundColor: 'white'
    },
    borderRadius: '0 20% 20% 0'
  };

  /**
   * Displays search results visualized on a map spatially.
   */
  return (
    <Box
      sx={{ height: '100%', position: 'relative' }}
      role="region"
      aria-label="Search Results Map">
      <MapContainer
        mapId="search_boundary_map"
        features={geometries}
        layerVisibility={layerVisibility}
        filterState={filterState}
        centroids={true}
        aria-label="Search Boundary Map">
        <SideBar sidebarOpen={sidebarOpen} aria-label="Sidebar">
          <LayerSwitcherInline
            layerVisibility={layerVisibility}
            legend={legend}
            filterState={filterState}
            aria-label="Layer Switcher"
          />
        </SideBar>

        {/* button that opens and closes the sidebar */}
        <IconButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={sidebarButtonStyle}
          aria-label={sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}>
          {sidebarOpen ? <ArrowBack /> : <LayersIcon />}
        </IconButton>
      </MapContainer>
    </Box>
  );
};

export default SearchPage;
