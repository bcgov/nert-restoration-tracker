import { mdiArrowCollapseDown, mdiExport } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import InfoDialog from 'components/dialog/InfoDialog';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import { focus, ICONS } from 'constants/misc';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import ProjectDetailsPage from 'features/projects/view/ProjectDetailsPage';
import { useNertApi } from 'hooks/useNertApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import PublicProjectAttachments from './components/PublicProjectAttachments';
import { S3FileType } from 'constants/attachments';
import ProjectDetails from 'features/projects/view/components//ProjectDetails';
import ProjectFocalSpecies from 'features/projects/view/components/ProjectFocalSpecies';
import { ProjectTableI18N, TableI18N } from 'constants/i18n';
import { exportData } from 'utils/dataTransfer';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

interface IProjectViewFormProps {
  project: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Page to display a single Public (published) Project.
 *
 * @return {*}
 */
// export default function PublicProjectView() {
const PublicProjectView: React.FC<IProjectViewFormProps> = (props) => {
  const { project, codes } = props;
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<IGetProjectAttachment[]>([]);

  const restorationTrackerApi = useNertApi();

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.public.project.getProjectAttachments(
          Number(project.project.project_id),
          S3FileType.ATTACHMENTS
        );

        if (response?.attachmentsList) {
          setAttachmentsList([...response.attachmentsList]);
        }

        const thumbnailResponse = await restorationTrackerApi.public.project.getProjectAttachments(
          Number(project.project.project_id),
          S3FileType.THUMBNAIL
        );

        if (thumbnailResponse?.attachmentsList) {
          setThumbnailImage([...thumbnailResponse.attachmentsList]);
        }
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.public.project, project.project.project_id, attachmentsList.length]
  );

  useEffect(() => {
    if (!isLoadingAttachments) {
      getAttachments(false);
      setIsLoadingAttachments(true);
    }
  }, [isLoadingAttachments, getAttachments]);

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
                      label={focus.LAND_BASED_RESTORATION_INITIATIVE}
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
                      <ProjectFocalSpecies projectViewData={project} />
                    </Box>
                  </Paper>
                </Box>

                <Box mb={1.2}>
                  <Paper elevation={2}>
                    <Accordion defaultExpanded={!!project.location.geometry?.length || false}>
                      <AccordionSummary
                        expandIcon={<Icon path={mdiArrowCollapseDown} size={1} />}
                        aria-controls="panel1-content"
                        id="panel1-header">
                        <Box
                          px={2}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width={'100%'}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h2">Restoration Project Area</Typography>
                          </Box>
                          <Box>
                            <Button
                              sx={{ height: '2.8rem', width: '10rem' }}
                              color="primary"
                              variant="outlined"
                              onClick={() => exportData([project])}
                              disableElevation
                              data-testid="export-project-button"
                              aria-label={ProjectTableI18N.exportProjectsData}
                              startIcon={<Icon path={mdiExport} size={1} />}>
                              {TableI18N.exportData}
                            </Button>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box height="500px" position="relative">
                          <LocationBoundary locationData={project.location} />
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                </Box>

                {/* Documents */}
                <Paper elevation={2}>
                  <PublicProjectAttachments
                    attachmentsList={attachmentsList}
                    getAttachments={getAttachments}
                  />
                </Paper>
              </Grid>

              <Grid item md={4}>
                <Paper elevation={2}>
                  <ProjectDetailsPage projectForViewData={project} codes={codes} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>
    </>
  );
};

export default PublicProjectView;
