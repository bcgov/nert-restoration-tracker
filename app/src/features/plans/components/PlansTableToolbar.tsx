import { Button, Toolbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { mdiExport } from '@mdi/js';
import Icon from '@mdi/react';
import { PlanTableI18N, TableI18N } from 'constants/i18n';
import React from 'react';
import { PlanData } from 'utils/pagedProjectPlanTableUtils';
import InfoDialog from 'components/dialog/InfoDialog';
import { exportData } from 'utils/dataTransfer';

interface PlansTableToolbarProps {
  numSelected: number;
  numRows: number;
  selectedPlans: PlanData[];
}

function PlansTableToolbar(props: PlansTableToolbarProps) {
  const { numSelected, numRows, selectedPlans } = props;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
        })
      }}
      aria-label="Plans Table Toolbar">
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
          aria-live="polite">
          {numSelected} {numSelected !== 1 ? PlanTableI18N.plans : PlanTableI18N.plan}{' '}
          {TableI18N.selectedToExport}
        </Typography>
      ) : (
        <Typography
          sx={{ mx: '0.5rem', flex: '1 1 100%' }}
          variant="h2"
          id="tableTitle"
          component="div"
          aria-live="polite">
          {TableI18N.found} {numRows} {numRows !== 1 ? PlanTableI18N.plans : PlanTableI18N.plan}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Button
          sx={{ height: '2.8rem', width: '10rem', fontWeight: 600 }}
          color="primary"
          variant="outlined"
          onClick={() => exportData(selectedPlans)}
          disableElevation
          data-testid="export-plan-button"
          aria-label={PlanTableI18N.exportPlansData}
          startIcon={<Icon path={mdiExport} size={1} />}>
          {TableI18N.exportData}
        </Button>
      ) : (
        <InfoDialog isProject={false} infoContent={'paged table'} />
      )}
    </Toolbar>
  );
}

export default PlansTableToolbar;
