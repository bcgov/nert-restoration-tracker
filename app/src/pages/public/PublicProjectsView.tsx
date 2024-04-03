import { mdiArrowLeft, mdiFullscreen } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ProjectPriorityChip, ProjectStatusChip } from 'components/chips/ProjectChips';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import TreatmentList from 'features/projects/view/components/TreatmentList';
import ProjectDetailsPage from 'features/projects/view/ProjectDetailsPage';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IGetProjectTreatment,
  TreatmentSearchCriteria
} from 'interfaces/useProjectPlanApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PublicProjectAttachments from './components/PublicProjectAttachments';
import PublicTreatmentSpatialUnits from './components/PublicTreatmentSpatialUnits';

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

// [OI] TODO this function is not implemented, part of the Project/Plan Non authenticated View 
// currently only shows the same project view for both projects and plans.

/**
 * Page to display a single Public (published) Project.
 *
 * @return {*}
 */
export default function PublicProjectsView() {
  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);

  const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(
    null
  );
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [treatmentList, setTreatmentList] = useState<IGetProjectTreatment[]>([]);

  const codes = useCodes();
console.log('Proj1', projectWithDetails)
  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await restorationTrackerApi.public.project.getProjectForView(
      projectId
    );

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.public.project, projectId]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.public.project.getProjectAttachments(
          projectId
        );

        if (!response?.attachmentsList) return;

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.public.project, projectId, attachmentsList.length]
  );

  const getTreatments = useCallback(
    async (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => {
      if (treatmentList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.public.project.getProjectTreatments(
          projectId,
          selectedYears
        );

        if (!response?.treatmentList) return;

        setTreatmentList([...response.treatmentList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.public.project, projectId, treatmentList.length]
  );

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      getAttachments(false);
      getTreatments(false);
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject, getAttachments, getTreatments]);

  if (!codes.codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

  const isPriority = projectWithDetails.location.priority === 'true';

  // Full Screen Map Dialog
  const openMapDialog = () => {
    setOpenFullScreen(true);
  };

  const closeMapDialog = () => {
    setOpenFullScreen(false);
  };

  return (
    <>
      <Container maxWidth="xl" data-testid="view_project_page_component">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h1">{projectWithDetails.project.project_name}</Typography>
            <Box mt={1.5} display="flex" flexDirection={'row'} alignItems="center">
              <Typography variant="subtitle2" component="span" color="textSecondary">
                Project Status:
              </Typography>
              <Box ml={1}>
                <ProjectStatusChip
                  startDate={projectWithDetails.project.start_date}
                  endDate={projectWithDetails.project.end_date}
                />
              </Box>
              {isPriority && (
                <Box ml={0.5}>
                  <ProjectPriorityChip />
                </Box>
              )}
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
                      <Typography variant="h2">Project Objectives</Typography>
                    </Box>
                    <Typography variant="body1" color="textSecondary">
                      {projectWithDetails.project.objectives}
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* Treatments */}
              <Box mb={3}>
                <Paper elevation={2}>
                  <Box px={3}>
                    <PublicTreatmentSpatialUnits
                      treatmentList={treatmentList}
                      getTreatments={getTreatments}
                    />
                  </Box>
                  <Box height="500px" position="relative">
                    <LocationBoundary
                      projectForViewData={projectWithDetails}
                      treatmentList={treatmentList}
                      refresh={getProject}
                    />
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
                  <TreatmentList treatmentList={treatmentList} />
                </Paper>
              </Box>

              {/* Documents */}
              <Paper elevation={2}>
                <PublicProjectAttachments projectForViewData={projectWithDetails} />
              </Paper>
            </Grid>

            <Grid item md={4}>
              <Paper elevation={2}>
                <ProjectDetailsPage
                  projectForViewData={projectWithDetails}
                  codes={codes.codes}
                  refresh={getProject}
                />
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
          <Box flex="1 1 auto">
            <PublicTreatmentSpatialUnits
              treatmentList={treatmentList}
              getTreatments={getTreatments}
            />
          </Box>
        </Box>
        <Box display="flex" height="100%" flexDirection="column">
          <Box flex="1 1 auto">
            <LocationBoundary
              projectForViewData={projectWithDetails}
              treatmentList={treatmentList}
              refresh={getProject}
            />
          </Box>
          <Box flex="0 0 auto" height="300px">
            <TreatmentList treatmentList={treatmentList} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
