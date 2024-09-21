import {
  IconButton,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography
} from '@mui/material';
import { Box } from '@mui/system';
import InfoIcon from '@mui/icons-material/Info';
import Checkbox from '@mui/material/Checkbox';
import { visuallyHidden } from '@mui/utils';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { ProjectTableI18N, TableI18N } from 'constants/i18n';
import React, { useState } from 'react';
import {
  ProjectData,
  ProjectHeadCell,
  projectHeadCells,
  ProjectsTableProps
} from 'utils/pagedProjectPlanTableUtils';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';

function ProjectsTableHead(props: ProjectsTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, myProject } =
    props;

  const createSortHandler = (property: keyof ProjectData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');

  const handleClickOpen = (headCell: ProjectHeadCell) => {
    setInfoTitle(headCell.infoButton ? headCell.infoButton : '');
    setInfoOpen(true);
  };

  const projectRows = projectHeadCells.map((headCell) => {
    if ('archive' !== headCell.id)
      return (
        <TableCell
          key={headCell.id}
          align={headCell.numeric ? 'right' : 'left'}
          padding={headCell.disablePadding ? 'none' : 'normal'}
          sortDirection={orderBy === headCell.id ? order : false}>
          <Tooltip title={headCell.tooltipLabel ? headCell.tooltipLabel : null} placement="top">
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}>
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? TableI18N.sortedDesc : TableI18N.sortedAsc}
                </Box>
              ) : null}
            </TableSortLabel>
          </Tooltip>

          {headCell.infoButton ? (
            <IconButton sx={{ p: 0 }} onClick={() => handleClickOpen(headCell)}>
              <InfoIcon color="info" />
            </IconButton>
          ) : null}
        </TableCell>
      );
  });

  return (
    <>
      <InfoDialogDraggable
        isProject={true}
        open={infoOpen}
        dialogTitle={infoTitle}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={true} contentIndex={infoTitle} />
      </InfoDialogDraggable>
      <TableHead>
        <TableRow>
          {projectRows}
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}>
            <TableCell>
              <>
                <Typography variant="inherit">{TableI18N.archive}</Typography>
                <Typography variant="inherit">{TableI18N.delete}</Typography>
              </>
            </TableCell>
          </SystemRoleGuard>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.PROJECT_CREATOR]}>
            <TableCell>
              {!myProject ? <></> : <Typography variant="inherit">{TableI18N.delete}</Typography>}
            </TableCell>
          </SystemRoleGuard>
          {!myProject ? (
            <TableCell padding="checkbox">
              <Tooltip title={ProjectTableI18N.exportAllProjects} placement="right">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={onSelectAllClick}
                  inputProps={{
                    'aria-label': ProjectTableI18N.selectAllProjectsForExport
                  }}
                />
              </Tooltip>
            </TableCell>
          ) : (
            <></>
          )}
        </TableRow>
      </TableHead>
    </>
  );
}

export default ProjectsTableHead;
