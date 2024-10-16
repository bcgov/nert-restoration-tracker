import { TableCell, TableHead, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import { TableI18N } from 'constants/i18n';
import React from 'react';
import { DraftData, draftHeadCells, DraftTableProps } from 'utils/pagedProjectPlanTableUtils';

function UserDetailDraftsTableHead(props: DraftTableProps) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler = (property: keyof DraftData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const draftRows = draftHeadCells.map((headCell) => {
    return (
      <TableCell
        key={headCell.id}
        align={headCell.numeric ? 'right' : 'left'}
        padding={headCell.disablePadding ? 'none' : 'normal'}
        sortDirection={orderBy === headCell.id ? order : false}
        aria-sort={
          orderBy === headCell.id ? (order === 'desc' ? 'descending' : 'ascending') : 'none'
        }>
        <Tooltip title={headCell.tooltipLabel ? headCell.tooltipLabel : ''} placement="top">
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={orderBy === headCell.id ? order : 'asc'}
            onClick={createSortHandler(headCell.id)}
            aria-label={`Sort by ${headCell.label}`}
            sx={
              orderBy === headCell.id
                ? {
                    '& .MuiTableSortLabel-icon': {
                      color: 'black !important'
                    }
                  }
                : {}
            }>
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
      <TableRow>
        {draftRows}
        <TableCell>
          <Typography variant="inherit">{TableI18N.status}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="inherit">{TableI18N.delete}</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

export default UserDetailDraftsTableHead;
