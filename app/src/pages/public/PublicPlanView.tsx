import { mdiArrowLeft, mdiFullscreen } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import PlanDetailsPage from 'features/plans/view/PlanDetailsPage';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import React, { useState } from 'react';

const pageStyles = {
  fullScreenBtn: {
    padding: '3px',
    borderRadius: '4px',
    background: '#ffffff',
    color: '#000000',
    border: '2px solid rgba(0,0,0,0.2)',
    backgroundClip: 'padding-box',
    '&:hover': {
      backgroundColor: '#eeeeee'
    }
  }
};

interface IPlanViewFormProps {
  plan: IGetPlanForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Page to display a single Public (published) Plans.
 *
 * @return {*}
 */
const PublicPlanView: React.FC<IPlanViewFormProps> = (props) => {
  const { plan, codes } = props;


  return (
    <>
      <Container maxWidth="xl" data-testid="view_plan_page_component">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h1">{plan.project.project_name}</Typography>
            <Box mt={1.5} display="flex" flexDirection={'row'} alignItems="center">
              <Typography variant="subtitle2" component="span" color="textSecondary">
                Plan Status:
              </Typography>
              <Box ml={1}>
                <Chip
                  size="small"
                  sx={getStatusStyle(plan.project.state_code)}
                  label={getStateLabelFromCode(plan.project.state_code)}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid item md={8}>
              <Box mb={3}>
                <Paper elevation={2}>
                  <Box height="500px" position="relative">
                    <LocationBoundary locationData={plan.location} />
                  </Box>
                </Paper>
              </Box>
            </Grid>

            <Grid item md={4}>
              <Paper elevation={2}>
                <PlanDetailsPage planForViewData={plan} codes={codes} />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

    </>
  );
};

export default PublicPlanView;
