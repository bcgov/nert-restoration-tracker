import React, { useState } from 'react';
import { useNertApi } from 'hooks/useNertApi';
import { Box, Container, Typography, Stack, Breadcrumbs, Link, Button } from '@mui/material';
import { ArrowBack, FileDownload } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router';
import { CustomReportI18N } from 'constants/i18n';
import { IGetCustomReportData } from 'interfaces/useAdminApi.interface';
import { csvDownload } from 'utils/cvsUtils';
import dayjs from 'dayjs';

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
 * Page to display Application Custom report.
 *
 * @return {*}
 */
const AppCustomReportPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  const history = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [customReportData, setCustomReportData] = useState<IGetCustomReportData[]>([]);
  const location = useLocation();
  const { startDate, endDate } = location.state;

  const startDateTime = dayjs(startDate).startOf('day').toISOString();
  const endDateTime = dayjs(endDate).endOf('day').toISOString();

  const getCustomReportData = async () => {
    const data = await restorationTrackerApi.admin.getCustomReport(startDateTime, endDateTime);
    setIsLoading(false);
    setCustomReportData(data);
  };

  if (isLoading) {
    getCustomReportData();
    return;
  }

  const handleCancel = () => {
    history('/admin/reports');
  };

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
          <Typography variant="h1">Custom Report</Typography>
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
        <Button
          sx={{ mt: 2 }}
          color="primary"
          variant="contained"
          size="large"
          onClick={() => csvDownload(customReportData, startDate, endDate)}
          data-testid="csv-report-download-button"
          aria-label={CustomReportI18N.downloadCsvFile}
          startIcon={<FileDownload />}>
          <span>{CustomReportI18N.downloadCsvFile}</span>
        </Button>
      </Box>
    </Container>
  );
};

export default AppCustomReportPage;
