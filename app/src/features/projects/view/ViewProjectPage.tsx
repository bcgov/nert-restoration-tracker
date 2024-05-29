import {
  mdiAccountMultipleOutline,
  mdiArrowLeft,
  mdiFilePdfBox,
  mdiFullscreen,
  mdiPencilOutline
} from '@mdi/js';
import { Icon } from '@mdi/react';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { RoleGuard } from 'components/security/Guards';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import { attachmentType, focus, ICONS } from 'constants/misc';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse
} from 'interfaces/useProjectPlanApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectAttachments from './ProjectAttachments';
import ProjectDetailsPage from './ProjectDetailsPage';

const pageStyles = {
  objectiveChip: {
    backgroundColor: '#E9FBFF',
    marginBottom: "2px",
    justifyContent: "left"
  },
  objectiveLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    // textWrap: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
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
    throw new Error('Invalid project ID.');
  }

  const projectId = Number(urlParams['id']);

  const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [project, setProject] = useState<IGetProjectForViewResponse | null>(null);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

  const codes = useCodes();

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse =
      await restorationTrackerApi.project.getProjectById(projectId);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProject(projectWithDetailsResponse);
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

  useEffect(() => {
    if (!isLoadingProject && !project) {
      getProject();
      getAttachments(false);
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, project, getProject, getAttachments]);
  if (!codes.isReady || !codes.codes || !project) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

  // Full Screen Map Dialog
  const openMapDialog = () => {
    setOpenFullScreen(true);
  };

  const closeMapDialog = () => {
    setOpenFullScreen(false);
  };

  const objectiveStyled = (objective) => {
    return (
      <Tooltip title={objective} disableHoverListener={objective.length < 130}>
        <Typography 
          sx={pageStyles.objectiveLabel}
          aria-label={`${objective}`}>
            {objective}
        </Typography>
      </Tooltip>
    );
  };

  return (
    <>
      <Container maxWidth="xl" data-testid="view_project_page_component">
        <Card sx={{ backgroundColor: '#E9FBFF', marginBottom: '0.6rem' }}>
          <Box ml={1} mt={0.5} display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h1">
                <img src={ICONS.PROJECT_ICON} width="20" height="32" alt="Project" />{' '}
                {project.project.project_name}
              </Typography>
              <Box mt={0.3} display="flex" flexDirection={'row'} alignItems="center">
                <Typography variant="subtitle2" component="span" color="textSecondary">
                  Project Status:
                </Typography>
                <Box ml={1}>
                  <Chip
                    size="small"
                    sx={getStatusStyle(project.project.state_code)}
                    label={getStateLabelFromCode(project.project.state_code)}
                  />
                  <Tooltip title={'Project workflow information'} placement="right">
                    <IconButton color={'info'}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box mb={1} display="flex" flexDirection={'row'} alignItems="center">
                <Typography variant="subtitle2" component="span" color="textSecondary">
                  Project Focus:
                </Typography>
                <Box ml={1}>
                  {project.project.is_healing_land && (
                    <Chip size="small" color={'default'} label={focus.HEALING_THE_LAND} />
                  )}
                  {project.project.is_healing_people && (
                    <Chip size="small" color={'default'} label={focus.HEALING_THE_PEOPLE} />
                  )}
                  {project.project.is_land_initiative && (
                    <Chip
                      size="small"
                      color={'default'}
                      label={focus.LAND_BASED_RESTOTRATION_INITIATIVE}
                    />
                  )}
                  {project.project.is_cultural_initiative && (
                    <Chip
                      size="small"
                      color={'default'}
                      label={focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE}
                    />
                  )}
                </Box>
              </Box>
              
            </Box>

            <RoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}>
              <Box mr={1} mt={1} sx={pageStyles.titleContainerActions}>
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
                  aria-label="edit project"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiPencilOutline} size={1} />}
                  // onClick={() => history(`/admin/projects/${urlParams['id']}/edit`)}
                >
                  Edit Project
                </Button>
                <Button
                  aria-label="print project"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiFilePdfBox} size={1} />}
                  // onClick={showPrintProjectDialog}
                >
                  Print
                </Button>
              </Box>
            </RoleGuard>
          </Box>

          <Box mx={1} mb={1}>
            <Grid container spacing={1}>
              <Grid item md={8}>
                <Box mb={1}>
                  <Paper elevation={2}>
                    <Box p={1}>
                      <Grid container spacing={0}>
                        <Grid item xs={2}>
                          <Card sx={{maxWidth: 200, borderRadius: "16px"}}>
                            <CardMedia
                                sx={{height: 124, borderRadius: "16px"}}
                                image="https://nrs.objectstore.gov.bc.ca/nerdel/local/restoration/projects/31/attachments/lizard.png"
                                title="green iguana"
                            />  
                          </Card>
                        </Grid>
                        <Grid item xs={10}>
                          <Box ml={1} mt={1.5}>
                            <Box>
                              <Typography variant="subtitle2" component="span" color="textSecondary" noWrap>
                                Project Size (Ha):
                              </Typography>
                              <Typography
                                ml={1}
                                sx={{ fontWeight: 'bold' }}
                                variant="subtitle2"
                                component="span"
                                color="textPrimary">
                                {project.location.size_ha}
                              </Typography>
                            </Box>

                            <Box mt={-0.6}>
                              <Typography variant="subtitle2" component="span" color="textSecondary">
                                Number of Sites:
                              </Typography>
                              <Typography
                                ml={1}
                                sx={{ fontWeight: 'bold' }}
                                variant="subtitle2"
                                component="span"
                                color="textPrimary">
                                {project.location.number_sites}
                              </Typography>
                            </Box>

                            <Box mt={-0.6}>
                              <Typography variant="subtitle2" component="span" color="textSecondary">
                                Number of People Involved:
                              </Typography>
                              <Typography
                                ml={1}
                                sx={{ fontWeight: 'bold' }}
                                variant="subtitle2"
                                component="span"
                                color="textPrimary">
                                {project.project.people_involved}
                              </Typography>
                            </Box>

                            <Box mt={-0.6}>
                              <Typography variant="subtitle2" component="span" color="textSecondary">
                                Project within or overlapping known area of cultural or conservation
                                priority:
                              </Typography>
                              <Typography
                                ml={1}
                                sx={{ fontWeight: 'bold' }}
                                variant="subtitle2"
                                component="span"
                                color="textPrimary">
                                {project.location.is_within_overlapping === 'D'
                                  ? "Don't know"
                                  : project.location.is_within_overlapping === 'Y'
                                    ? 'Yes'
                                    : 'No'}
                              </Typography>
                            </Box>

                            <Box mt={-0.6}>
                              <Typography variant="subtitle2" component="span" color="textSecondary">
                                Project part of a publicly available restoration plan:
                              </Typography>
                              <Typography
                                ml={1}
                                sx={{ fontWeight: 'bold' }}
                                variant="subtitle2"
                                component="span"
                                color="textPrimary">
                                {!project.project.is_project_part_public_plan ? 'No' : 'Yes'}
                              </Typography>
                            </Box>




                          </Box>
                        </Grid>
                      </Grid>

                      
                      <Box mt={1}>
                        <Typography sx={{ fontWeight: 'bold' }} variant="subtitle2">Project Objectives:</Typography>

                        {/* TODO [OI] Here we need to iterate thru the objectives array and display accordingly for now just hard coded the objectives*/}
                          {/* {project.project.objective && project.objective.map((objective, key) => { */}
                          
                          <Box display="flex" flexDirection={'column'} alignItems="left">
                            <Chip size="small" sx={pageStyles.objectiveChip} label={objectiveStyled("This is a very long objective string that contains 200 characters. This is a very long objective string that contains 200 characters. This is a very long objective string that contains 200 characters.")}/>
                            <Chip size="small" sx={pageStyles.objectiveChip} label={objectiveStyled("This is project objective one and it is a string with 67 characters")}/>
                            <Chip size="small" sx={pageStyles.objectiveChip} label={objectiveStyled("Objective three is to preserve habitad")}/>
                            <Chip size="small" sx={pageStyles.objectiveChip} label={objectiveStyled("Objective four for this project")}/>
                            <Chip size="small" sx={pageStyles.objectiveChip} label={objectiveStyled("Objective five for this project")}/>
                          </Box>
                           {/* })} */}
                      </Box>

                      

                      

                      

                      
                    </Box>
                  </Paper>
                </Box>

                <Box mb={1.2}>
                  <Paper elevation={2}>
                    <Box height="500px" position="relative">
                      <LocationBoundary locationData={project.location} />
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
                  <ProjectDetailsPage projectForViewData={project} codes={codes.codes} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>

      <Dialog fullScreen open={openFullScreen} onClose={closeMapDialog}>
        <Box pr={3} pl={1} display="flex" alignItems="center">
          <Box mr={1}>
            <IconButton onClick={closeMapDialog} aria-label="back to project" size="large">
              <Icon path={mdiArrowLeft} size={1} />
            </IconButton>
          </Box>
        </Box>
        <Box display="flex" height="100%" flexDirection="column">
          <Box flex="1 1 auto">
            <LocationBoundary locationData={project.location} scrollWheelZoom={true} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default ViewProjectPage;
