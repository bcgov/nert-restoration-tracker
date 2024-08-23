import { Button, Toolbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { mdiExport } from '@mdi/js';
import Icon from '@mdi/react';
import { ProjectTableI18N, TableI18N } from 'constants/i18n';
import React from 'react';
import { ProjectData } from 'utils/pagedProjectPlanTableUtils';
import InfoDialog from 'components/dialog/InfoDialog';
import { exportData } from 'utils/dataTransfer';

interface ProjectTableToolbarProps {
  numSelected: number;
  numRows: number;
  selectedProjects: ProjectData[];
}

function ProjectsTableToolbar(props: ProjectTableToolbarProps) {
  const { numSelected, numRows, selectedProjects } = props;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
        })
      }}>
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} {numSelected !== 1 ? ProjectTableI18N.projects : ProjectTableI18N.project}{' '}
          {TableI18N.selectedToExport}
        </Typography>
      ) : (
        <Typography
          sx={{ mx: '0.5rem', flex: '1 1 100%' }}
          variant="h2"
          id="tableTitle"
          component="div">
          {TableI18N.found} {numRows}{' '}
          {numRows !== 1 ? ProjectTableI18N.projects : ProjectTableI18N.project}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Button
          sx={{ height: '2.8rem', width: '10rem', fontWeight: 600 }}
          color="primary"
          variant="outlined"
          onClick={() => exportData(selectedProjects)}
          disableElevation
          data-testid="export-project-button"
          aria-label={ProjectTableI18N.exportProjectsData}
          startIcon={<Icon path={mdiExport} size={1} />}>
          {TableI18N.exportData}
        </Button>
      ) : (
        <InfoDialog isProject={true} infoContent={'paged table'} />
      )}
    </Toolbar>
  );
}

export default ProjectsTableToolbar;
