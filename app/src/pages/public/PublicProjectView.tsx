import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
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
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import PublicProjectAttachments from './components/PublicProjectAttachments';
import ProjectConservationAreas from 'features/projects/view/components/ProjectConservationAreas';

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

  const restorationTrackerApi = useRestorationTrackerApi();

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.public.project.getProjectAttachments(
          Number(project.project.project_id)
        );

        if (!response?.attachmentsList) return;

        setAttachmentsList([...response.attachmentsList]);
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
          </Box>

          <Box mx={1} mb={1}>
            <Grid container spacing={1}>
              <Grid item md={8}>
                <Box mb={1}>
                  <Paper elevation={2}>
                    <Box p={1}>
                      <Grid container spacing={0}>
                        <Grid item xs={2}>
                          <Card sx={{ maxWidth: 200, borderRadius: '16px' }}>
                            <CardMedia
                              sx={{ height: 200, borderRadius: '16px' }}
                              image="https://nrs.objectstore.gov.bc.ca/nerdel/local/restoration/projects/31/attachments/lizard.png"
                              title="green iguana"
                            />
                          </Card>
                        </Grid>
                        <Grid item xs={10}>
                          <Box ml={1}>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                component="span"
                                color="textSecondary"
                                noWrap>
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
                              <Typography
                                variant="subtitle2"
                                component="span"
                                color="textSecondary">
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
                              <Typography
                                variant="subtitle2"
                                component="span"
                                color="textSecondary">
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
                              <Typography
                                variant="subtitle2"
                                component="span"
                                color="textSecondary">
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

                            <Box mt={-0.6}>
                              <Typography
                                variant="subtitle2"
                                component="span"
                                color="textSecondary">
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
                              {project.location.is_within_overlapping === 'Y' && (
                                <Box
                                  ml={1}
                                  display="flex"
                                  flexDirection={'column'}
                                  alignItems="left">
                                  <ProjectConservationAreas projectViewData={project} />
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box mt={1}>
                        <Typography sx={{ fontWeight: 'bold' }} variant="subtitle2">
                          Project Objectives:
                        </Typography>
                        <Box display="flex" flexDirection={'column'} alignItems="left">
                          <ProjectObjectives projectViewData={project} />
                        </Box>
                      </Box>
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
                  <PublicProjectAttachments projectForViewData={project} />
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
