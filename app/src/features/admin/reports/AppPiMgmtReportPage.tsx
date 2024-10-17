import React, { useState, useMemo } from 'react';
import { useNertApi } from 'hooks/useNertApi';
import {
  Box,
  Container,
  Typography,
  Stack,
  Breadcrumbs,
  Link,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  TablePagination,
  Switch,
  Card,
  Tooltip,
  Chip
} from '@mui/material';
import { IGetPiMgmtReport } from 'interfaces/useAdminApi.interface';
import dayjs from 'dayjs';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ArrowBack } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router';
import * as utils from 'utils/pagedProjectPlanTableUtils';
import { TableI18N } from 'constants/i18n';
import AppPiMgmtReportTableToolbar from './AppPiMgmtReportTableToolbar';
import AppPiMgmtReportTableHead from './AppPiMgmtReportTableHead';

const pageStyles = {
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  },
  roleChip: {
    backgroundColor: '#4371C5',
    color: '#ffffff'
  },
  project: {
    backgroundColor: '#E9FBFF'
  },
  plan: {
    backgroundColor: '#FFF4EB'
  }
};
/**
 * Page to display Application PI report.
 *
 * @return {*}
 */
const AppPiMgmtReportPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  const history = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [piMgmtReportData, setPiMgmtReportData] = useState<utils.PiMgmtReportData[]>([]);
  const [page, setPage] = useState(0);
  const location = useLocation();
  const { startDate, endDate } = location.state;

  function mapToTableData(data: IGetPiMgmtReport[]): utils.PiMgmtReportData[] {
    const rowsPiMgmtReport = data
      ? data.map((row, index) => {
          return {
            id: index,
            project_id: row.project_id,
            project_name: row.project_name,
            is_project: row.is_project ? 'true' : 'false',
            user_name: row.user_name,
            date: row.date,
            operation: row.operation,
            file_name: row.file_name,
            file_type: row.file_type
              ? row.file_type + ' uploaded'
              : !row.is_project
                ? 'INSERT' !== row.operation
                  ? 'plan updated'
                  : 'plan created'
                : 'INSERT' !== row.operation
                  ? 'project updated'
                  : 'project created'
          } as utils.PiMgmtReportData;
        })
      : [];
    return rowsPiMgmtReport;
  }

  const startDateTime = dayjs(startDate).startOf('day').toISOString();
  const endDateTime = dayjs(endDate).endOf('day').toISOString();

  const getPiMgmtReportData = async () => {
    const data = await restorationTrackerApi.admin.getPiMgmtReport(startDateTime, endDateTime);
    setIsLoading(false);
    setPiMgmtReportData(mapToTableData(data));
  };

  if (isLoading) {
    getPiMgmtReportData();
    return;
  }

  const handleCancel = () => {
    history('/admin/reports');
  };

  function formatDateTime(date: string) {
    return dayjs(date).format(DATE_FORMAT.ShortMediumDateTimeFormat);
  }

  function PiMgmtReportTable() {
    const [order, setOrder] = useState<utils.Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof utils.PiMgmtReportData>('date');
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (
      event: React.MouseEvent<unknown>,
      property: keyof utils.PiMgmtReportData
    ) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
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

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - piMgmtReportData.length) : 0;

    const visibleRows = useMemo(
      () =>
        utils
          .stableSort(piMgmtReportData, utils.getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage]
    );
    return (
      <Box sx={{ width: '100%' }}>
        <AppPiMgmtReportTableToolbar numRows={piMgmtReportData.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 200 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}>
            <AppPiMgmtReportTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={piMgmtReportData.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `app-user-report-table-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={row.id} sx={{ cursor: 'pointer' }}>
                    <TableCell component="th" id={labelId} scope="row" padding="normal">
                      <Link
                        data-testid={row.project_name}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={
                          'true' !== row.is_project
                            ? () => history(`/admin/plans/${row.project_id}/details`)
                            : () => history(`/admin/projects/${row.project_id}/details`)
                        }>
                        {row.project_name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.user_name}</TableCell>
                    <TableCell>{formatDateTime(row.date)}</TableCell>
                    <TableCell>{row.operation}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          <Tooltip title={row.file_name} placement="top">
                            <Typography variant="inherit">{row.file_type}</Typography>
                          </Tooltip>
                        }
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
                  <TableCell colSpan={9} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="space-between" sx={{ backgroundColor: '#E2DDFB' }}>
          <FormControlLabel
            sx={{ ml: '0.5rem' }}
            control={<Switch size="small" checked={dense} onChange={handleChangeDense} />}
            label={<Typography variant="caption">{TableI18N.densePadding}</Typography>}
          />
          <TablePagination
            sx={{ backgroundColor: '#E2DDFB' }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={piMgmtReportData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box mt={1}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component="button"
            color="primary"
            onClick={handleCancel}
            aria-current="page"
            sx={pageStyles.breadCrumbLink}>
            <ArrowBack color="primary" fontSize="small" sx={pageStyles.breadCrumbLinkIcon} />
            <Typography variant="body2">Cancel and Exit</Typography>
          </Link>
        </Breadcrumbs>
      </Box>
      <Box my={2}>
        <Stack direction="column">
          <Typography variant="h1">Personal Information (PI) Management Report</Typography>
          <Stack direction="row" spacing={1}>
            <Typography variant="h3">from:</Typography>
            <Typography variant="h3" color="gray">
              {startDate}
            </Typography>
            <Typography variant="h3">to:</Typography>
            <Typography variant="h3" color="gray">
              {endDate}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      <Card>
        <PiMgmtReportTable />
      </Card>
    </Container>
  );
};

export default AppPiMgmtReportPage;
