import { TableCell, TableHead, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import { TableI18N } from 'constants/i18n';
import React from 'react';
import {
  AppReportData,
  appReportHeadCells,
  AppReportTableProps
} from 'utils/pagedProjectPlanTableUtils';

function AppReportTableHead(props: AppReportTableProps) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler =
    (property: keyof AppReportData) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  const appReportRows = appReportHeadCells.map((headCell) => {
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
      </TableCell>
    );
  });

  return (
    <TableHead>
      <TableRow>{appReportRows}</TableRow>
    </TableHead>
  );
}

export default AppReportTableHead;
