import { mdiMenuDown } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectTreatment, TreatmentSearchCriteria } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

const pageStyles = {
  filterMenu: {
    minWidth: '200px !important',
    padding: 0,
    borderBottom: '1px solid #ffffff',
    '&:last-child': {
      borderBottom: 'none'
    }
  }
};

export interface IProjectSpatialUnitsProps {
  treatmentList: IGetProjectTreatment[];
  getTreatments: (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const PublicTreatmentSpatialUnits: React.FC<IProjectSpatialUnitsProps> = (props) => {
  const { getTreatments } = props;
  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);
  const restorationTrackerApi = useRestorationTrackerApi();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [isTreatmentLoading, setIsTreatmentLoading] = useState(false);

  const [yearList, setYearList] = useState<{ year: number }[]>([]);
  const [selectedSpatialLayer, setSelectedSpatialLayer] = useState({ boundary: true });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleSelectedSwitch = (selectedName: string | number) => {
    setSelectedSpatialLayer({
      ...selectedSpatialLayer,
      [selectedName]: !selectedSpatialLayer[selectedName]
    });

    const selectedArray: TreatmentSearchCriteria = { years: [] };

    Object.keys(selectedSpatialLayer).forEach((key) => {
      //handles async discrepancies for selected years
      if (
        (selectedSpatialLayer[key] && key !== selectedName) ||
        (key === selectedName && !selectedSpatialLayer[key])
      ) {
        selectedArray.years.push(key);
      }
    });

    getTreatments(true, selectedArray);
  };

  const getTreatmentYears = useCallback(
    async (forceFetch: boolean) => {
      if (yearList.length && !forceFetch) {
        return;
      }

      try {
        const yearsResponse = await restorationTrackerApi.public.project.getProjectTreatmentsYears(
          projectId
        );

        if (!yearsResponse) {
          return;
        }

        const sortedYearsResponse = [...yearsResponse].sort(function (a, b) {
          return a.year - b.year;
        });

        setYearList(sortedYearsResponse);

        sortedYearsResponse.forEach((year) => {
          selectedSpatialLayer[String(year.year)] = true;
        });
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.public.project, projectId, yearList.length, selectedSpatialLayer]
  );

  useEffect(() => {
    if (!isTreatmentLoading && !yearList.length) {
      getTreatmentYears(true);
      setIsTreatmentLoading(true);
    }
  }, [getTreatmentYears, yearList.length, isTreatmentLoading]);

  return (
    <Box>
      <Toolbar disableGutters>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography variant="h2">Restoration Treatments</Typography>

          <Box>
            <Button
              id={'open-layer-menu'}
              data-testid={'open-layer-menu'}
              variant="outlined"
              color="primary"
              title={'Filter Treaatments'}
              aria-label={'Filter Treatments'}
              endIcon={<Icon path={mdiMenuDown} size={1} />}
              onClick={handleClick}>
              Filter Treatments ({yearList?.length})
            </Button>

            <Menu
              id="treatment-menu"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}>
              {!yearList && <Typography>No Treatment Years Available</Typography>}
              {yearList.length >= 1 &&
                yearList.map((year) => {
                  return (
                    <MenuItem
                      dense
                      disableGutters
                      sx={pageStyles.filterMenu}
                      key={year.year}
                      selected={selectedSpatialLayer[year.year]}
                      onClick={() => handleSelectedSwitch(year.year)}>
                      <Checkbox checked={selectedSpatialLayer[year.year]} color="primary" />
                      <Box flexGrow={1} ml={0.5}>
                        {year.year}
                      </Box>
                    </MenuItem>
                  );
                })}
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default PublicTreatmentSpatialUnits;
