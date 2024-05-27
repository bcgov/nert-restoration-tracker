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
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
// import ProjectDetailsPage from 'features/projects/view/ProjectDetailsPage';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/useProjectApi.interface';
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
  const { plan } = props;

  // Full Screen Map Dialog
  const [openFullScreen, setOpenFullScreen] = useState(false);
  const openMapDialog = () => {
    setOpenFullScreen(true);
  };

  const closeMapDialog = () => {
    setOpenFullScreen(false);
  };

  return (
    <>
      <Container maxWidth="xl" data-testid="view_plan_page_component">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h1">{plan.plan.project_name}</Typography>
            <Box mt={1.5} display="flex" flexDirection={'row'} alignItems="center">
              <Typography variant="subtitle2" component="span" color="textSecondary">
                Plan Status:
              </Typography>
              <Box ml={1}>
                <Chip
                  size="small"
                  sx={getStatusStyle(plan.plan.state_code)}
                  label={getStateLabelFromCode(plan.plan.state_code)}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid item md={8}>
              {/* Project Objectives */}
              <Box mb={3}>
                <Paper elevation={2}>
                  <Box p={3}>
                    <Box mb={2}>
                      <Typography variant="h2">Plan Objectives</Typography>
                    </Box>
                    <Typography variant="body1" color="textSecondary">
                      {plan.plan.objectives}
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              <Box mb={3}>
                <Paper elevation={2}>
                  <Box height="500px" position="relative">
                    <LocationBoundary locationData={plan.location} />
                    <Box position="absolute" top="80px" left="10px" zIndex="999">
                      <IconButton
                        aria-label="view full screen map"
                        title="View full screen map"
                        sx={pageStyles.fullScreenBtn}
                        onClick={openMapDialog}
                        size="large">
                        <Icon path={mdiFullscreen} size={1} />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Grid>

            <Grid item md={4}>
              <Paper elevation={2}>
                {/* <ProjectDetailsPage
                  planForViewData={plan}
                  codes={codes}
                /> */}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog fullScreen open={openFullScreen} onClose={closeMapDialog}>
        <Box pr={3} pl={1} display="flex" alignItems="center">
          <Box>
            <IconButton onClick={closeMapDialog} size="large">
              <Icon path={mdiArrowLeft} size={1} />
            </IconButton>
          </Box>
        </Box>
        <Box display="flex" height="100%" flexDirection="column">
          <Box flex="1 1 auto">
            <LocationBoundary locationData={plan.location} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default PublicPlanView;
