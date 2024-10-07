import { Toolbar, Typography } from '@mui/material';
import { TableI18N, PiMgmtReportTableI18N } from 'constants/i18n';
import React from 'react';

interface IAppPiMgmtTableToolbarProps {
  numRows: number;
}

function AppPiMgmtReportTableToolbar(props: IAppPiMgmtTableToolbarProps) {
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
        {TableI18N.found} {numRows}{' '}
        {numRows !== 1 ? PiMgmtReportTableI18N.records : PiMgmtReportTableI18N.record}
      </Typography>
      {/* we can add an info dialogue if needed */}
      {/* <InfoDialog isProject={isProject} infoContent={'drafts table'} /> */}
    </Toolbar>
  );
}

export default AppPiMgmtReportTableToolbar;
