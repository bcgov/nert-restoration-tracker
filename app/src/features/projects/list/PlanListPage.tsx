import { mdiExport } from '@mdi/js';
import Icon from '@mdi/react';
import FilterListIcon from '@mui/icons-material/FilterList';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetPlanForViewResponse } from 'interfaces/useProjectPlanApi.interface';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDate } from 'utils/Utils';
interface Data {
  id: number;
  planId: number;
  planName: string;
  term: string;
  org: string;
  startDate: string;
  endDate: string;
  statusCode: number;
  statusLabel: string;
}

const getStatusLabelFromCode = (statusCode: number) => {
  return (
    {
      0: 'DRAFT',
      1: 'PLANNING',
      7: 'COMPLETED',
      8: 'ARCHIVED'
    }[statusCode] ?? 'UNDEFINED'
  );
};

const setStatusBgColor = (statusCode: number) => {
  return (
    {
      0: '#A6A6A6',
      1: '#AA72D4',
      7: '#70AD47',
      8: '#FF5D5D'
    }[statusCode] ?? 'black'
  );
};

const getStatusStyle = (statusCode: number) => {
  return { color: 'white', backgroundColor: setStatusBgColor(statusCode) };
};
interface IPlansListProps {
  plans: IGetPlanForViewResponse[];
}

const PlanListPage: React.FC<IPlansListProps> = (props) => {
  const { plans } = props;

  const history = useHistory();

  const rows = plans?.map((row, index) => {
    return {
      id: index,
      planId: row.project.project_id,
      planName: row.project.project_name,
      term: row.permit.permits.map((item: { permit_number: any }) => item.permit_number).join(', '),
      org: row.contact.contacts.map((item) => item.agency).join(', '),
      startDate: row.project.start_date,
      endDate: row.project.end_date,
      statusCode: row.project.status_code,
      statusLabel: getStatusLabelFromCode(row.project.status_code),
      statusStyle: getStatusStyle(row.project.status_code)
    } as Data;
  });

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  type Order = 'asc' | 'desc';

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
  }

  const headCells: readonly HeadCell[] = [
    {
      id: 'planName',
      numeric: false,
      disablePadding: true,
      label: 'Plan Name'
    },
    {
      id: 'term',
      numeric: false,
      disablePadding: false,
      label: 'Term'
    },
    {
      id: 'org',
      numeric: false,
      disablePadding: false,
      label: 'Organizations'
    },
    {
      id: 'startDate',
      numeric: false,
      disablePadding: false,
      label: 'Start Date'
    },
    {
      id: 'endDate',
      numeric: false,
      disablePadding: false,
      label: 'End Date'
    },
    {
      id: 'statusLabel',
      numeric: false,
      disablePadding: false,
      label: 'Status'
    }
  ];

  interface PlansTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
  }

  function PlansTableHead(props: PlansTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}>
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}>
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell padding="checkbox">
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={onSelectAllClick}
                  inputProps={{
                    'aria-label': 'select all plans'
                  }}
                />
              }
              label={
                <Typography noWrap variant="inherit">
                  Select All
                </Typography>
              }
            />
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  interface PlansTableToolbarProps {
    numSelected: number;
  }

  function PlansTableToolbar(props: PlansTableToolbarProps) {
    const { numSelected } = props;

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
            {numSelected} {numSelected !== 1 ? 'plans' : 'plan'} selected to export
          </Typography>
        ) : (
          <Typography
            sx={{ mx: '0.5rem', flex: '1 1 100%' }}
            variant="h2"
            id="tableTitle"
            component="div">
            Found {plans?.length} {plans?.length !== 1 ? 'plans' : 'plan'}
          </Typography>
        )}
        {numSelected > 0 ? (
          <Button
            sx={{ height: '3rem', width: '11rem' }}
            color="primary"
            variant="outlined"
            disableElevation
            data-testid="export-plan-button"
            aria-label={'export plan area map'}
            startIcon={<Icon path={mdiExport} size={1} />}>
            <strong>Export maps</strong>
          </Button>
        ) : (
          <Tooltip title="Filter plans">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    );
  }

  function PlanTable() {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Data>('planName');
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        const newSelected = rows.map((n) => n.id);
        setSelected(newSelected);
        return;
      }
      setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: readonly number[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }
      setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
      setDense(event.target.checked);
    };

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = React.useMemo(
      () =>
        stableSort(rows, getComparator(order, orderBy)).slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        ),
      [order, orderBy, page, rowsPerPage]
    );

    return (
      <Box sx={{ width: '100%' }}>
        <PlansTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}>
            <PlansTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `plans-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}>
                    <TableCell component="th" id={labelId} scope="row" padding="normal">
                      <Link
                        data-testid={row.planName}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={() => history.push(`/admin/projects/${row.planId}`)}>
                        {row.planName}
                      </Link>
                    </TableCell>
                    <TableCell align="left">{row.term}</TableCell>
                    <TableCell align="left">{row.org}</TableCell>
                    <TableCell align="left">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.startDate)}
                    </TableCell>
                    <TableCell align="left">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.endDate)}
                    </TableCell>
                    <TableCell align="left">
                      <Chip
                        size="small"
                        sx={getStatusStyle(row.statusCode)}
                        label={row.statusLabel}
                      />
                    </TableCell>
                    <TableCell padding="checkbox">
                      <FormControlLabel
                        control={
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId
                            }}
                            onClick={(event) => handleClick(event, row.id)}
                          />
                        }
                        label={<Typography variant="inherit">Export</Typography>}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows
                  }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="space-between" sx={{ backgroundColor: '#FFF4EB' }}>
          <FormControlLabel
            sx={{ ml: '0.5rem' }}
            control={<Switch size="small" checked={dense} onChange={handleChangeDense} />}
            label={<Typography variant="caption">Dense padding</Typography>}
          />
          <TablePagination
            sx={{ backgroundColor: '#FFF4EB' }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    );
  }

  /**
   * Displays plans list.
   */
  return (
    <Card>
      <PlanTable />
    </Card>
  );
};

export default PlanListPage;
