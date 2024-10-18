import { Toolbar, Typography } from '@mui/material';
import { ProjectTableI18N, PlanTableI18N, TableI18N } from 'constants/i18n';
import React from 'react';
import InfoDialog from 'components/dialog/InfoDialog';

interface DarftTableToolbarProps {
  numRows: number;
  isProject: boolean;
}

function UserDetailDraftsTableToolbar(props: DarftTableToolbarProps) {
  const { numRows, isProject } = props;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        background: isProject ? '#E9FBFF' : '#FFF4EB'
      }}
      aria-labelledby="draftTableTitle">
      <Typography
        sx={{ mx: '0.5rem', flex: '1 1 100%' }}
        variant="h2"
        id="draftTableTitle"
        component="div">
        {TableI18N.found} {numRows} {isProject ? ProjectTableI18N.project : PlanTableI18N.plan}{' '}
        {numRows !== 1 ? TableI18N.drafts : TableI18N.draft}
      </Typography>
      <InfoDialog isProject={isProject} infoContent={'drafts table'} />
    </Toolbar>
  );
}

export default UserDetailDraftsTableToolbar;
