import { mdiAccountMultipleOutline, mdiArrowLeft, mdiFullscreen, mdiPencilOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ProjectPriorityChip, ProjectStatusChip } from 'components/chips/ProjectChips';
// import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { RoleGuard } from 'components/security/Guards';
// import { DeleteProjectI18N } from 'constants/i18n';
import { attachmentType } from 'constants/misc';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
// import { DialogContext } from 'contexts/dialogContext';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
// import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse
} from 'interfaces/useProjectPlanApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import TreatmentList from './components/TreatmentList';
// import TreatmentSpatialUnits from './components/TreatmentSpatialUnits';
import ProjectAttachments from './ProjectAttachments';
import ProjectDetailsPage from './ProjectDetailsPage';

const pageStyles = {
  titleContainerActions: {
    '& button + button': {
      marginLeft: '1rem'
    }
  },
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

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ViewProjectPage: React.FC = () => {
  // const history = useNavigate();
  const urlParams: Record<string, string | number | undefined> = useParams();

  if (!urlParams['id']) {
    throw new Error(
      "The project ID found in ProjectContextProvider was invalid. Does your current React route provide an 'id' parameter?"
    );
  }

  const projectId = Number(urlParams['id']);

  // const dialogContext = useContext(DialogContext);

  const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(
    null
  );
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  // const [treatmentList, setTreatmentList] = useState<IGetProjectTreatment[]>([]);

  const codes = useCodes();

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse =
      await restorationTrackerApi.project.getProjectById(projectId);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.project, urlParams]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.project.getProjectAttachments(
          projectId,
          attachmentType.ATTACHMENTS
        );

        if (!response?.attachmentsList) return;

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.project, projectId, attachmentsList.length]
  );

  // const getTreatments = useCallback(
  //   async (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => {
  //     if (treatmentList.length && !forceFetch) return;

  //     try {
  //       const response = await restorationTrackerApi.project.getProjectTreatments(
  //         projectId,
  //         selectedYears
  //       );

  //       if (!response?.treatmentList) return;

  //       setTreatmentList([...response.treatmentList]);
  //     } catch (error) {
  //       return error;
  //     }
  //   },
  //   [restorationTrackerApi.project, projectId, treatmentList.length]
  // );

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      getAttachments(false);
      // getTreatments(false);
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject, getAttachments]);
  if (!codes.isReady || !codes.codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

  // const defaultYesNoDialogProps = {
  //   dialogTitle: DeleteProjectI18N.deleteTitle,
  //   dialogText: DeleteProjectI18N.deleteText,

  //   open: false,
  //   onClose: () => dialogContext.setYesNoDialog({ open: false }),
  //   onNo: () => dialogContext.setYesNoDialog({ open: false }),
  //   onYes: () => dialogContext.setYesNoDialog({ open: false })
  // };

  //TODO: Priority is not in the project location object
  const isPriority = false; //projectWithDetails.location.priority === 'true';

  // const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
  //   dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  // };

  // const deleteErrorDialogProps = {
  //   dialogTitle: DeleteProjectI18N.deleteErrorTitle,
  //   dialogText: DeleteProjectI18N.deleteErrorText,
  //   open: false,
  //   onClose: () => {
  //     dialogContext.setErrorDialog({ open: false });
  //   },
  //   onOk: () => {
  //     dialogContext.setErrorDialog({ open: false });
  //   }
  // };

  // const showDeleteProjectDialog = () => {
  //   dialogContext.setYesNoDialog({
  //     ...defaultYesNoDialogProps,
  //     open: true,
  //     yesButtonLabel: 'Delete',
  //     yesButtonProps: { color: 'secondary' },
  //     noButtonLabel: 'Cancel',
  //     onYes: () => {
  //       deleteProject();
  //       dialogContext.setYesNoDialog({ open: false });
  //     }
  //   });
  // };

  // const deleteProject = async () => {
  //   if (!projectWithDetails) {
  //     return;
  //   }

  //   try {
  //     const response = await restorationTrackerApi.project.deleteProject(
  //       projectWithDetails.project.project_id
  //     );

  //     if (!response) {
  //       showDeleteErrorDialog({ open: true });
  //       return;
  //     }

  //     history('/admin/user/projects');
  //   } catch (error) {
  //     const apiError = error as APIError;
  //     showDeleteErrorDialog({ dialogText: apiError.message, open: true });
  //     return error;
  //   }
  // };

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
          <RoleGuard
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
            validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}>
            <Box sx={pageStyles.titleContainerActions}>
              <Button
                aria-label="manage project team"
                variant="outlined"
                color="primary"
                startIcon={<Icon path={mdiAccountMultipleOutline} size={1} />}
                // onClick={() => history('users')}
              >
                Project Team
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Icon path={mdiPencilOutline} size={1} />}
                // onClick={() => history(`/admin/projects/${urlParams['id']}/edit`)}
              >
                Edit Project
              </Button>
              <RoleGuard
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
                validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                <Button
                  aria-label="delete project"
                  variant="outlined"
                  color="primary"
                  // onClick={showDeleteProjectDialog}
                >
                  Print
                </Button>
              </RoleGuard>
            </Box>
          </RoleGuard>
        </Box>

        <Box mt={2}>
          <Grid container spacing={4}>
            <Grid item md={8}>
              {/* Project Objectives */}
              <Box mb={3}>
                <Paper elevation={2}>
                  <Box p={3}>
                    <Box mb={2}>
                      <Typography variant="h2">Project Objectives</Typography>
                    </Box>
                    <Typography variant="body1" color="textSecondary">
                      {projectWithDetails.project.brief_desc}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
              {/* Treatments */}
              <Box mb={3}>
                <Paper elevation={2}>
                  <Box px={3}>
                    {/* <TreatmentSpatialUnits
                      getTreatments={getTreatments}
                      getAttachments={getAttachments}
                    /> */}
                  </Box>
                  <Box height="500px" position="relative">
                    <LocationBoundary locationData={projectWithDetails.location} />
                    <Box position="absolute" top="80px" left="10px" zIndex="999">
                      <IconButton
                        aria-label="view full screen map"
                        title="View full screen map"
                        style={pageStyles.fullScreenBtn}
                        onClick={openMapDialog}
                        size="large">
                        <Icon path={mdiFullscreen} size={1} />
                      </IconButton>
                    </Box>
                  </Box>
                  {/* <TreatmentList treatmentList={treatmentList} /> */}
                </Paper>
              </Box>
              {/* Documents */}
              <Paper elevation={2}>
                <ProjectAttachments
                  attachmentsList={attachmentsList}
                  getAttachments={getAttachments}
                />
              </Paper>
            </Grid>
            <Grid item md={4}>
              <Paper elevation={2}>
                <ProjectDetailsPage projectForViewData={projectWithDetails} codes={codes.codes} />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog fullScreen open={openFullScreen} onClose={closeMapDialog}>
        <Box pr={3} pl={1} display="flex" alignItems="center">
          <Box mr={1}>
            <IconButton onClick={closeMapDialog} aria-label="back to project" size="large">
              <Icon path={mdiArrowLeft} size={1} />
            </IconButton>
          </Box>
          {/* <Box flex="1 1 auto">
            <TreatmentSpatialUnits getTreatments={getTreatments} getAttachments={getAttachments} />
          </Box> */}
        </Box>
        <Box display="flex" height="100%" flexDirection="column">
          <Box flex="1 1 auto">
            <LocationBoundary locationData={projectWithDetails.location} scrollWheelZoom={true} />
          </Box>
          {/* <Box flex="0 0 auto" height="300px">
            <TreatmentList treatmentList={treatmentList} />
          </Box> */}
        </Box>
      </Dialog>
    </>
  );
};

export default ViewProjectPage;
