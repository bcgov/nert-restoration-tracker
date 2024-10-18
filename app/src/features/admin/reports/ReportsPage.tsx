import { Box, Container, Paper, Typography, Button, Divider, Stack } from '@mui/material';
import { mdiNewspaperVariant } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useNertApi } from 'hooks/useNertApi';
import React, { useContext, useState } from 'react';
import DateRangeSelection from './DateRangeSelection';
import ReportsSelection from './ReportsSelection';
import DashboardCard from './DashboardCard';
import { IGetReport } from 'interfaces/useAdminApi.interface';
import dayjs from 'dayjs';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useNavigate } from 'react-router';
import { DialogContext } from 'contexts/dialogContext';

/**
 * Displays the reports page.
 *
 * @return {*}
 */
const ReportsPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  const history = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<IGetReport>();

  const [selectedReport, setSelectedReport] = useState('appUserReport');
  const [selectedRange, setSelectedRange] = useState('currentMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const getDashboardData = async () => {
    const data = await restorationTrackerApi.admin.getDashboardReport();

    setIsLoading(false);
    setDashboardData(data);
  };

  if (isLoading) {
    getDashboardData();
    return;
  }

  const formattedPlanCreateDateValue =
    (dashboardData?.last_created.plan.datetime &&
      dayjs(dashboardData.last_created.plan.datetime).format(
        DATE_FORMAT.ShortMediumDateTimeFormat
      )) ||
    null;
  const formattedProjectCreateDateValue =
    (dashboardData?.last_created.project.datetime &&
      dayjs(dashboardData.last_created.project.datetime).format(
        DATE_FORMAT.ShortMediumDateTimeFormat
      )) ||
    null;
  const formattedPlanUpdatedDateValue =
    (dashboardData?.last_updated.plan.datetime &&
      dayjs(dashboardData.last_updated.plan.datetime).format(
        DATE_FORMAT.ShortMediumDateTimeFormat
      )) ||
    null;
  const formattedProjectUpdatedDateValue =
    (dashboardData?.last_updated.project.datetime &&
      dayjs(dashboardData.last_updated.project.datetime).format(
        DATE_FORMAT.ShortMediumDateTimeFormat
      )) ||
    null;

  function resolveStartDate(dateRange: string) {
    if ('currentMonth' === dateRange) {
      return dayjs().startOf('month').format(DATE_FORMAT.ShortMediumDateFormat);
    }
    if ('lastMonth' === dateRange) {
      return dayjs()
        .subtract(1, 'month')
        .startOf('month')
        .format(DATE_FORMAT.ShortMediumDateFormat);
    }
    return dayjs(startDate).format(DATE_FORMAT.ShortMediumDateFormat);
  }

  function resolveEndDate(dateRange: string) {
    if ('currentMonth' === dateRange) {
      return dayjs().endOf('month').format(DATE_FORMAT.ShortMediumDateFormat);
    }
    if ('lastMonth' === dateRange) {
      return dayjs().subtract(1, 'month').endOf('month').format(DATE_FORMAT.ShortMediumDateFormat);
    }
    return dayjs(endDate).format(DATE_FORMAT.ShortMediumDateFormat);
  }

  return (
    <Container maxWidth="xl">
      <Box my={2}>
        <Typography variant="h1">Dashboard</Typography>
      </Box>
      {dashboardData && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }}>
          <DashboardCard
            type={1}
            showLast={true}
            label1="Published:"
            label2="Drafts:"
            label3="Archived:"
            label1Value={dashboardData.project.published_projects}
            label2Value={dashboardData.project.draft_projects}
            label3Value={dashboardData.project.archived_projects}
            value1Name={dashboardData.last_created.project.name}
            value2Datetime={formattedProjectCreateDateValue}
            value3Id={dashboardData.last_created.project.id}
            value4Name={dashboardData.last_updated.project.name}
            value5Datetime={formattedProjectUpdatedDateValue}
            value6Id={dashboardData.last_updated.project.id}
            dividerLabel1="Statistics"
            dividerLabel2="Last published"
            dividerLabel3="Last updated"
          />
          <DashboardCard
            type={2}
            showLast={true}
            label1="Published:"
            label2="Drafts:"
            label3="Archived:"
            label1Value={dashboardData.plan.published_plans}
            label2Value={dashboardData.plan.draft_plans}
            label3Value={dashboardData.plan.archived_plans}
            value1Name={dashboardData.last_created.plan.name}
            value2Datetime={formattedPlanCreateDateValue}
            value3Id={dashboardData.last_created.plan.id}
            value4Name={dashboardData.last_updated.plan.name}
            value5Datetime={formattedPlanUpdatedDateValue}
            value6Id={dashboardData.last_updated.plan.id}
            dividerLabel1="Statistics"
            dividerLabel2="Last published"
            dividerLabel3="Last updated"
          />
          <DashboardCard
            type={4}
            showLast={false}
            label1="Administrators:"
            label2="Maintainers:"
            label3="Creators:"
            label1Value={dashboardData.user.admins}
            label2Value={dashboardData.user.maintainers}
            label3Value={dashboardData.user.creators}
            dividerLabel1="Statistics"
          />
        </Stack>
      )}

      <Box my={2}>
        <Typography variant="h1">Reports</Typography>
      </Box>

      <Paper sx={{ minWidth: 210 }}>
        <ReportsSelection selectedReport={selectedReport} setSelectedReport={setSelectedReport} />
        <Divider />
        {'appUserReport' !== selectedReport && (
          <DateRangeSelection
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        )}
        <Divider />
        <Button
          sx={{ m: 2 }}
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Icon path={mdiNewspaperVariant} size={1} />}
          onClick={() => {
            if ('appUserReport' === selectedReport) {
              history('/admin/reports/user');
              return;
            }
            if ('customRange' === selectedRange) {
              if (!startDate || !endDate) {
                dialogContext.setErrorDialog({
                  dialogTitle: 'Dates Validation Failed',
                  dialogText: 'Please enter the required start and end dates.',
                  ...defaultErrorDialogProps,
                  open: true
                });
                return;
              }
              if (dayjs(startDate) > dayjs(endDate)) {
                dialogContext.setErrorDialog({
                  dialogTitle: 'Dates Validation Failed',
                  dialogText: 'Start date cannot be after end date.',
                  ...defaultErrorDialogProps,
                  open: true
                });
                return;
              }
            }

            if ('customReport' === selectedReport) {
              history('/admin/reports/custom', {
                state: {
                  startDate: resolveStartDate(selectedRange),
                  endDate: resolveEndDate(selectedRange)
                }
              });
              return;
            }
            history('/admin/reports/pimgmt', {
              state: {
                startDate: resolveStartDate(selectedRange),
                endDate: resolveEndDate(selectedRange)
              }
            });
          }}
          data-testid="report-generate-button">
          <span>Generate Report</span>
        </Button>
      </Paper>
    </Container>
  );
};

export default ReportsPage;
