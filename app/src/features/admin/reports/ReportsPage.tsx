import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useNertApi } from 'hooks/useNertApi';
import React from 'react';
import DateRangeSelection from './DateRangeSelection';
import { Button, Divider, Stack } from '@mui/material';
import ReportsSelection from './ReportsSelection';
import DashboardCard from './DashboardCard';

/**
 * Page to display reports.
 *
 * @return {*}
 */
const ReportsPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();

  const numberProjects = 17;
  const numberProjectsDrafts = 5;
  const numberProjectsArchived = 0;

  return (
    <Container maxWidth="xl">
      <Box my={2}>
        <Typography variant="h1">Dashboard</Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }}>
        <DashboardCard
          type={1}
          label1="Published:"
          label2="Drafts:"
          label3="Archived:"
          label1Value={numberProjects}
          label2Value={numberProjectsDrafts}
          label3Value={numberProjectsArchived}
        />
        <DashboardCard
          type={2}
          label1="Published:"
          label2="Drafts:"
          label3="Archived:"
          label1Value={numberProjects}
          label2Value={numberProjectsDrafts}
          label3Value={numberProjectsArchived}
        />
        <DashboardCard
          type={4}
          label1="Administrators:"
          label2="Maintainers:"
          label3="Creators:"
          label1Value={3}
          label2Value={2}
          label3Value={10}
        />
      </Stack>
      <Box my={2}>
        <Typography variant="h1">Reports</Typography>
      </Box>

      <Paper sx={{ minWidth: 210 }}>
        <DateRangeSelection />
        <Divider />
        <ReportsSelection />
        <Divider />
        <Button
          sx={{ m: 2 }}
          variant="contained"
          color="primary"
          size="large"
          // onClick={() => setOpenYesNoDialog(true)}
          data-testid="report-generate-button">
          <span>Generate Report</span>
        </Button>
      </Paper>
    </Container>
  );
};

export default ReportsPage;
