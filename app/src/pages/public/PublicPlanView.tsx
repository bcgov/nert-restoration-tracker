import { mdiExport } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import { Card } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import InfoDialog from 'components/dialog/InfoDialog';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import PlanDetailsPage from 'features/plans/view/PlanDetailsPage';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import React, { useState, useCallback, useEffect } from 'react';
import MapContainer from 'components/map/MapContainer';
import LayerSwitcher from 'components/map/components/LayerSwitcher';
import { focus, ICONS } from 'constants/misc';
import PlanDetails from 'features/plans/view/components/PlanDetails';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { S3FileType } from 'constants/attachments';
import { useNertApi } from 'hooks/useNertApi';
import { ProjectTableI18N, TableI18N } from 'constants/i18n';

const pageStyles = {
  layerSwitcherContainer: {
    position: 'relative',
    bottom: '-70px'
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

  const bounds = calculateUpdatedMapBounds(plan?.location.geometry || [], true) || null;
  /**
   * Reactive state to share between the layer picker and the map
   */
  const boundary = useState<boolean>(true);
  const wells = useState<boolean>(false);
  const projects = useState<boolean>(true);
  const plans = useState<boolean>(true);
  const wildlife = useState<boolean>(false);
  const indigenous = useState<boolean>(false);
  const baselayer = useState<string>('hybrid');

  const layerVisibility = {
    boundary,
    wells,
    projects,
    plans,
    wildlife,
    indigenous,
    baselayer
  };

  const [isLoadingThumbnailImage, setIsLoadingThumbnailImage] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<IGetProjectAttachment[]>([]);

  const restorationTrackerApi = useNertApi();

  const getThumbnailImage = useCallback(
    async (forceFetch: boolean) => {
      if (thumbnailImage.length && !forceFetch) return;

      try {
        const thumbnailResponse = await restorationTrackerApi.public.project.getProjectAttachments(
          Number(plan.project.project_id),
          S3FileType.THUMBNAIL
        );

        if (thumbnailResponse?.attachmentsList) {
          setThumbnailImage([...thumbnailResponse.attachmentsList]);
        }
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.public.project, plan.project.project_id, thumbnailImage.length]
  );

  useEffect(() => {
    if (!isLoadingThumbnailImage) {
      getThumbnailImage(false);
      setIsLoadingThumbnailImage(true);
    }
  }, [isLoadingThumbnailImage, getThumbnailImage]);

  return (
    <>
      <Container maxWidth="xl" data-testid="view_plan_page_component">
        <Card sx={{ backgroundColor: '#FFF4EB', marginBottom: '0.6rem' }}>
          <Box ml={1} mt={0.5} display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h1">
                <img src={ICONS.PLAN_ICON} width="20" height="32" alt="Project" />{' '}
                {plan.project.project_name}
              </Typography>
              <Box mt={0.3} display="flex" flexDirection={'row'} alignItems="center">
                <Typography variant="subtitle2" component="span" color="textSecondary">
                  Plan Status:
                </Typography>
                <Box ml={1}>
                  <Chip
                    size="small"
                    sx={getStatusStyle(plan.project.state_code)}
                    label={getStateLabelFromCode(plan.project.state_code)}
                  />
                  <InfoDialog isProject={false} infoContent={'workflow'} />
                </Box>
              </Box>
              <Box mb={1} display="flex" flexDirection={'row'} alignItems="center">
                <Typography variant="subtitle2" component="span" color="textSecondary">
                  Plan Focus:
                </Typography>
                <Box ml={1}>
                  {plan.project.is_healing_land && (
                    <Chip size="small" color={'default'} label={focus.HEALING_THE_LAND} />
                  )}
                  {plan.project.is_healing_people && (
                    <Chip size="small" color={'default'} label={focus.HEALING_THE_PEOPLE} />
                  )}
                  {plan.project.is_land_initiative && (
                    <Chip
                      size="small"
                      color={'default'}
                      label={focus.LAND_BASED_RESTOTRATION_INITIATIVE}
                    />
                  )}
                  {plan.project.is_cultural_initiative && (
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
                      <PlanDetails plan={plan} thumbnailImageUrl={thumbnailImage[0]?.url} />
                    </Box>
                  </Paper>
                </Box>
                <Paper elevation={2}>
                  <Box
                    px={1}
                    py={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center">
                    <Typography variant="h2">Restoration Plan Area</Typography>
                    <Button
                      sx={{ height: '2.8rem', width: '10rem' }}
                      color="primary"
                      variant="outlined"
                      disableElevation
                      data-testid="export-project-button"
                      aria-label={ProjectTableI18N.exportProjectsData}
                      startIcon={<Icon path={mdiExport} size={1} />}>
                      {TableI18N.exportData}
                    </Button>
                  </Box>

                  <Box height={500} position="relative">
                    <MapContainer
                      mapId={'plan_location_map'}
                      layerVisibility={layerVisibility}
                      features={plan.location.geometry}
                      bounds={bounds}
                      mask={null}
                    />
                  </Box>
                  <Box sx={pageStyles.layerSwitcherContainer}>
                    <LayerSwitcher layerVisibility={layerVisibility}  hideProjects={true}/>
                  </Box>
                </Paper>
                <Box mt={2} />
              </Grid>
              <Grid item md={4}>
                <Paper elevation={2}>
                  <PlanDetailsPage planForViewData={plan} codes={codes} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>
    </>
  );
};

export default PublicPlanView;
