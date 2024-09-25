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
  Chip,
  FormControlLabel,
  TablePagination,
  Switch,
  Card
} from '@mui/material';
import { IGetAppReport } from 'interfaces/useAdminApi.interface';
import dayjs from 'dayjs';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ArrowBack } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router';
import * as utils from 'utils/pagedProjectPlanTableUtils';
import AppReportTableToolbar from './AppReportTableToolbar';
import AppReportTableHead from './AppReportTableHead';
import { TableI18N } from 'constants/i18n';

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
 * Page to display Application report.
 *
 * @return {*}
 */
const ApplicationReportPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  const history = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [appReportData, setAppReportData] = useState<utils.AppReportData[]>([]);
  const [page, setPage] = useState(0);
  const location = useLocation();
  const { dateRange, reportType, startDate, endDate } = location.state;

  function mapToTableData(data: IGetAppReport[]): utils.AppReportData[] {
    const rowsAppReport = data
      ? data.map((row, index) => {
          return {
            id: index,
            user_id: row.user_id,
            user_name: row.user_name,
            role_names: row.role_names.map((item) => item).join('\r'),
            prj_count: row.prj_count,
            plan_count: row.plan_count,
            arch_prj_count: row.arch_prj_count,
            arch_plan_count: row.arch_plan_count,
            draft_prj_count: row.draft_prj_count,
            draft_plan_count: row.draft_plan_count
          } as utils.AppReportData;
        })
      : [];
    return rowsAppReport;
  }

  const getAppReportData = async () => {
    const data = await restorationTrackerApi.admin.getAppReport();
    setIsLoading(false);
    setAppReportData(mapToTableData(data));
  };

  if (isLoading) {
    getAppReportData();
    return;
  }

  const formattedStartDate =
    (startDate && dayjs(startDate).format(DATE_FORMAT.ShortMediumDateFormat)) || null;
  const formattedEndDate =
    (endDate && dayjs(endDate).format(DATE_FORMAT.ShortMediumDateFormat)) || null;

  const handleCancel = () => {
    history('/admin/reports');
  };

  function ApplicationReportTable() {
    const [order, setOrder] = useState<utils.Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof utils.AppReportData>('user_name');
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (
      event: React.MouseEvent<unknown>,
      property: keyof utils.AppReportData
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
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - appReportData.length) : 0;

    const visibleRows = useMemo(
      () =>
        utils
          .stableSort(appReportData, utils.getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage]
    );

    return (
      <Box sx={{ width: '100%' }}>
        <AppReportTableToolbar numRows={appReportData.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 200 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}>
            <AppReportTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={appReportData.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `app-report-table-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={row.id} sx={{ cursor: 'pointer' }}>
                    <TableCell component="th" id={labelId} scope="row" padding="normal">
                      <Link
                        data-testid={row.user_name}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={() => history(`/admin/users/${row.user_id}/details`)}>
                        {row.user_name}
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      <Chip
                        data-testid="user-role-chip"
                        sx={pageStyles.roleChip}
                        size="small"
                        label={row.role_names}
                      />
                    </TableCell>
                    <TableCell sx={pageStyles.project} align="center">
                      {row.prj_count}
                    </TableCell>
                    <TableCell sx={pageStyles.project} align="center">
                      {row.draft_prj_count}
                    </TableCell>
                    <TableCell sx={pageStyles.project} align="center">
                      {row.arch_prj_count}
                    </TableCell>
                    <TableCell sx={pageStyles.plan} align="center">
                      {row.plan_count}
                    </TableCell>
                    <TableCell sx={pageStyles.plan} align="center">
                      {row.draft_plan_count}
                    </TableCell>
                    <TableCell sx={pageStyles.plan} align="center">
                      {row.arch_plan_count}
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
            count={appReportData.length}
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
        <Breadcrumbs>
          <Link
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
          <Typography variant="h1">Application Report</Typography>
          {startDate && (
            <Stack direction="row" spacing={1}>
              <Typography variant="h3">from:</Typography>
              <Typography variant="h3" color="gray">
                {formattedStartDate}
              </Typography>
              <Typography variant="h3">to:</Typography>
              <Typography variant="h3" color="gray">
                {formattedEndDate}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
      {appReportData && (
        <Card>
          <ApplicationReportTable />
        </Card>
      )}
    </Container>
  );
};

export default ApplicationReportPage;
