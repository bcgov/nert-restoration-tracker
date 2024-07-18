import { mdiAccountMultipleOutline, mdiFilePdfBox, mdiPencilOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import InfoDialog from 'components/dialog/InfoDialog';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import { focus, ICONS } from 'constants/misc';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import ProjectDetailsPage from 'features/projects/view/ProjectDetailsPage';
import useCodes from 'hooks/useCodes';
import { useNertApi } from 'hooks/useNertApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { S3FileType } from 'constants/attachments';
import ProjectDetails from './components/ProjectDetails';
import { ProjectRoleGuard } from 'components/security/Guards';

const pageStyles = {
  conservationAreChip: {
    marginBottom: '2px',
    justifyContent: 'left'
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
  const history = useNavigate();
  const urlParams: Record<string, string | number | undefined> = useParams();

  if (!urlParams['id']) {
    throw new Error('Invalid project ID.');
  }

  const projectId = Number(urlParams['id']);

  const restorationTrackerApi = useNertApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [project, setProject] = useState<IGetProjectForViewResponse | null>(null);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<IGetProjectAttachment[]>([]);

  const codes = useCodes();

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse =
      await restorationTrackerApi.project.getProjectById(projectId);

    if (!projectWithDetailsResponse || !projectWithDetailsResponse.project.is_project) {
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
          S3FileType.ATTACHMENTS
        );

        if (response?.attachmentsList) {
          setAttachmentsList([...response.attachmentsList]);
        }

        const thumbnailResponse = await restorationTrackerApi.project.getProjectAttachments(
          projectId,
          S3FileType.THUMBNAIL
        );

        if (thumbnailResponse?.attachmentsList) {
          setThumbnailImage([...thumbnailResponse.attachmentsList]);
        }
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
                  <InfoDialog isProject={true} infoContent={'workflow'} />
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

            <ProjectRoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
              validProjectPermissions={[]}>
              <Box
                mr={1}
                mt={1}
                sx={pageStyles.titleContainerActions}
                display="flex"
                flexDirection={'row'}
                alignItems="flex-start">
                <Button
                  aria-label="manage project team"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiAccountMultipleOutline} size={1} />}
                  onClick={() => history(`/admin/projects/${urlParams['id']}/users`)}>
                  Team
                </Button>
                <Button
                  aria-label="edit project"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiPencilOutline} size={1} />}
                  onClick={() => history(`/admin/projects/${urlParams['id']}/edit`)}>
                  Edit
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
            </ProjectRoleGuard>
          </Box>

          <Box mx={1} mb={1}>
            <Grid container spacing={1}>
              <Grid item md={8}>
                <Box mb={1}>
                  <Paper elevation={2}>
                    <Box p={1}>
                      <ProjectDetails
                        project={project}
                        thumbnailImageUrl={thumbnailImage[0]?.url}
                      />

                      <ProjectObjectives projectViewData={project} />
                    </Box>
                  </Paper>
                </Box>

                <Box mb={1.2}>
                  <Paper elevation={2}>
                    <Box height="500px" position="relative">
                      <LocationBoundary locationData={project.location} />
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
    </>
  );
};

export default ViewProjectPage;
