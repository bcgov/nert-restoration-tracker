import { mdiAccountMultipleOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { RoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlanDetailsPage from './PlanDetailsPage';
import MapContainer from 'components/map/MapContainer';
import LayerSwitcher from 'components/map/components/LayerSwitcher';
import { DeletePlanI18N } from 'constants/i18n';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { Card, Chip, Tooltip } from '@mui/material';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import InfoIcon from '@mui/icons-material/Info';
import { S3FileType } from 'constants/attachments';
import PlanDetails from './components/PlanDetails';
import { focus, ICONS } from 'constants/misc';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

const pageStyles = {
  titleContainerActions: {
    '& button + button': {
      marginLeft: '1rem'
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

  const dialogContext = useContext(DialogContext);

  // const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const restorationTrackerApi = useRestorationTrackerApi();

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

  const defaultYesNoDialogProps = {
    dialogTitle: DeletePlanI18N.deleteTitle,
    dialogText: DeletePlanI18N.deleteText,

    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  const bounds = calculateUpdatedMapBounds(planWithDetails?.location.geometry || [], true) || null;

  const deleteErrorDialogProps = {
    dialogTitle: DeletePlanI18N.deleteErrorTitle,
    dialogText: DeletePlanI18N.deleteErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showDeletePlanDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      yesButtonLabel: 'Delete',
      yesButtonProps: { color: 'secondary' },
      noButtonLabel: 'Cancel',
      onYes: () => {
        deletePlan();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deletePlan = async () => {
    if (!planWithDetails) {
      return;
    }

    try {
      const response = await restorationTrackerApi.plan.deletePlan(
        planWithDetails.project.project_id
      );

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history('/admin/user/projects');
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

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
        <Card sx={{ backgroundColor: '#E9FBFF', marginBottom: '0.6rem' }}>
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
                  <Tooltip title={'Plan workflow information'} placement="right">
                    <IconButton color={'info'}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
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
                      label={focus.LAND_BASED_RESTOTRATION_INITIATIVE}
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
            <RoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}>
              <Box p={2} sx={pageStyles.titleContainerActions}>
                <Button
                  aria-label="manage plan team"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiAccountMultipleOutline} size={1} />}
                  onClick={() => history(`/admin/plans/${urlParams['id']}/users`)}>
                  Plan Team
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiPencilOutline} size={1} />}
                  onClick={() => history(`/admin/plans/${urlParams['id']}/edit`)}>
                  Edit Plan
                </Button>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                  <Button
                    aria-label="delete plan"
                    variant="outlined"
                    color="primary"
                    startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                    onClick={showDeletePlanDialog}>
                    Delete
                  </Button>
                </RoleGuard>
              </Box>
            </RoleGuard>
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
                <Paper elevation={2}>
                  <Box p={2}>
                    <Typography variant="h2">Location</Typography>
                  </Box>
                  <Box height={500}>
                    <MapContainer
                      mapId={'plan_location_map'}
                      layerVisibility={layerVisibility}
                      features={planWithDetails.location.geometry}
                      bounds={bounds}
                      mask={null}
                    />
                  </Box>
                  <Box sx={pageStyles.layerSwitcherContainer}>
                    <LayerSwitcher layerVisibility={layerVisibility} />
                  </Box>
                </Paper>
                <Box mt={2} />
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
