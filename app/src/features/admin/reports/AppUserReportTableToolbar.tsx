import { Toolbar, Typography } from '@mui/material';
import { TableI18N, AppUserReportTableI18N } from 'constants/i18n';
import React from 'react';

interface IAppUserReportTableToolbarProps {
  numRows: number;
}

function AppUserReportTableToolbar(props: IAppUserReportTableToolbarProps) {
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
        {numRows !== 1 ? AppUserReportTableI18N.users : AppUserReportTableI18N.user}
      </Typography>
      {/* we can add an info dialogue if needed */}
      {/* <InfoDialog isProject={isProject} infoContent={'drafts table'} /> */}
    </Toolbar>
  );
}

export default AppUserReportTableToolbar;
