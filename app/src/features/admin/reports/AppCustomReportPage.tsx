import React from 'react';
import { useNertApi } from 'hooks/useNertApi';
import { Box, Container, Typography, Stack, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router';

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
const AppCustomReportPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  const history = useNavigate();

  const location = useLocation();
  const { startDate, endDate } = location.state;

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
      </Box>
    </Container>
  );
};

export default AppCustomReportPage;
