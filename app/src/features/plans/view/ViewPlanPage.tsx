import {
  mdiAccountMultipleOutline,
  mdiPencilOutline,
  mdiFilePdfBox,
  mdiExport,
  mdiImport,
  mdiArrowCollapseDown
} from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import InfoDialog from 'components/dialog/InfoDialog';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import useCodes from 'hooks/useCodes';
import { useNertApi } from 'hooks/useNertApi';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlanDetailsPage from './PlanDetailsPage';
import { Accordion, AccordionDetails, AccordionSummary, Card, Chip } from '@mui/material';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import { S3FileType } from 'constants/attachments';
import PlanDetails from './components/PlanDetails';
import { focus, ICONS } from 'constants/misc';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { ProjectRoleGuard } from 'components/security/Guards';
import { ProjectTableI18N, PlanTableI18N, TableI18N } from 'constants/i18n';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';

const pageStyles = {
  titleContainerActions: {
    '& button + button': {
      marginLeft: 1
    }
  },
  layerSwitcherContainer: {
    position: 'relative',
    bottom: '-70px'
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
 * Page to display a single Plan.
 *
 * @return {*}
 */
const ViewPlanPage: React.FC = () => {
  const history = useNavigate();
  const urlParams: Record<string, string | number | undefined> = useParams();

  if (!urlParams['id']) {
    throw new Error(
      "The plan ID found in PlanContextProvider was invalid. Does your current React route provide an 'id' parameter?"
    );
  }

  const planId = Number(urlParams['id']);

  // const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const restorationTrackerApi = useNertApi();

  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [planWithDetails, setPlanWithDetails] = useState<IGetPlanForViewResponse | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<IGetProjectAttachment[]>([]);

  const codes = useCodes();

  const getPlan = useCallback(async () => {
    const planWithDetailsResponse = await restorationTrackerApi.plan.getPlanById(planId);

    if (!planWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setPlanWithDetails(planWithDetailsResponse);
  }, [restorationTrackerApi.plan, urlParams]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (thumbnailImage.length && !forceFetch) return;

      try {
        const thumbnailResponse = await restorationTrackerApi.project.getProjectAttachments(
          planId,
          S3FileType.THUMBNAIL
        );

        if (thumbnailResponse?.attachmentsList) {
          setThumbnailImage([...thumbnailResponse.attachmentsList]);
        }
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.plan, planId]
  );

  useEffect(() => {
    if (!isLoadingPlan && !planWithDetails) {
      getPlan();
      getAttachments(false);
      setIsLoadingPlan(true);
    }
  }, [isLoadingPlan, planWithDetails, getPlan, getAttachments]);

  const bounds = calculateUpdatedMapBounds(planWithDetails?.location.geometry || [], true) || null;

  // const closeMapDialog = () => {
  //   setOpenFullScreen(false);
  // };

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

  if (!codes.isReady || !codes.codes || !planWithDetails) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

  return (
    <>
      <Container maxWidth="xl" data-testid="view_plan_page_component">
        <Card sx={{ backgroundColor: '#FFF4EB', marginBottom: '0.6rem' }}>
          <Box ml={1} mt={0.5} display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h1">
                <img src={ICONS.PLAN_ICON} width="20" height="32" alt="Project" />{' '}
                {planWithDetails.project.project_name}
              </Typography>
              <Box mt={0.3} display="flex" flexDirection={'row'} alignItems="center">
                <Typography variant="subtitle2" component="span" color="textSecondary">
                  Plan Status:
                </Typography>
                <Box ml={1}>
                  <Chip
                    size="small"
                    sx={getStatusStyle(planWithDetails.project.state_code)}
                    label={getStateLabelFromCode(planWithDetails.project.state_code)}
                  />
                  <InfoDialog isProject={false} infoContent={'workflow'} />
                </Box>
              </Box>
              <Box mb={1} display="flex" flexDirection={'row'} alignItems="center">
                <Typography variant="subtitle2" component="span" color="textSecondary">
                  Plan Focus:
                </Typography>
                <Box ml={1}>
                  {planWithDetails.project.is_healing_land && (
                    <Chip size="small" color={'default'} label={focus.HEALING_THE_LAND} />
                  )}
                  {planWithDetails.project.is_healing_people && (
                    <Chip size="small" color={'default'} label={focus.HEALING_THE_PEOPLE} />
                  )}
                  {planWithDetails.project.is_land_initiative && (
                    <Chip
                      size="small"
                      color={'default'}
                      label={focus.LAND_BASED_RESTORATION_INITIATIVE}
                    />
                  )}
                  {planWithDetails.project.is_cultural_initiative && (
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
                  aria-label="manage plan team"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiAccountMultipleOutline} size={1} />}
                  onClick={() => history(`/admin/plans/${urlParams['id']}/users`)}>
                  Team
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiPencilOutline} size={1} />}
                  onClick={() => history(`/admin/plans/${urlParams['id']}/edit`)}>
                  Edit
                </Button>
                <Button
                  aria-label="print plan"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiFilePdfBox} size={1} />}
                  // onClick={showPrintPlanDialog}
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
                      <PlanDetails
                        plan={planWithDetails}
                        thumbnailImageUrl={thumbnailImage[0]?.url}
                      />
                    </Box>
                  </Paper>
                </Box>

                <Box mb={1.2}>
                  <Paper elevation={2}>
                    <Accordion
                      defaultExpanded={!!planWithDetails.location.geometry?.length || false}>
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
                            <Typography variant="h2">Restoration Plan Area</Typography>
                          </Box>
                          <Box>
                            <Button
                              sx={{ height: '2.8rem', width: '10rem' }}
                              color="primary"
                              variant="outlined"
                              disableElevation
                              data-testid="export-planWithDetails-button"
                              aria-label={ProjectTableI18N.exportProjectsData}
                              startIcon={<Icon path={mdiExport} size={1} />}>
                              {TableI18N.exportData}
                            </Button>

                            <ProjectRoleGuard
                              validSystemRoles={[
                                SYSTEM_ROLE.SYSTEM_ADMIN,
                                SYSTEM_ROLE.DATA_ADMINISTRATOR
                              ]}
                              validProjectRoles={[
                                PROJECT_ROLE.PROJECT_LEAD,
                                PROJECT_ROLE.PROJECT_EDITOR
                              ]}
                              validProjectPermissions={[]}>
                              <Button
                                sx={{ height: '2.8rem', width: '10rem', marginLeft: 1 }}
                                color="primary"
                                variant="outlined"
                                disableElevation
                                data-testid="import-planWithDetails-button"
                                aria-label={PlanTableI18N.importPlanData}
                                startIcon={<Icon path={mdiImport} size={1} />}>
                                {TableI18N.importData}
                              </Button>
                            </ProjectRoleGuard>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box height="500px" position="relative">
                          <LocationBoundary locationData={planWithDetails.location} />
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Paper elevation={2}>
                  <PlanDetailsPage planForViewData={planWithDetails} codes={codes.codes} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>
    </>
  );
};

export default ViewPlanPage;
