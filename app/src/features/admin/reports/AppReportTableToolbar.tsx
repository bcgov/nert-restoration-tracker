import { Toolbar, Typography } from '@mui/material';
import { TableI18N, AppReportTableI18N } from 'constants/i18n';
import React from 'react';

interface IAppReportTableToolbarProps {
  numRows: number;
}

function AppReportTableToolbar(props: IAppReportTableToolbarProps) {
  const { numRows } = props;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        background: '#E2DDFB'
      }}>
      <Typography
        sx={{ mx: '0.5rem', flex: '1 1 100%' }}
        variant="h2"
        id="draftTableTitle"
        component="div">
        {TableI18N.found} {numRows} {'Active '}
        {numRows !== 1 ? AppReportTableI18N.users : AppReportTableI18N.user}
      </Typography>
      {/* we can add an info dialogue if needed */}
      {/* <InfoDialog isProject={isProject} infoContent={'drafts table'} /> */}
    </Toolbar>
  );
}

export default AppReportTableToolbar;
