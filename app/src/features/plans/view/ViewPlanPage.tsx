import {
  mdiAccountMultipleOutline,
  mdiArrowLeft,
  mdiPencilOutline,
  mdiTrashCanOutline
} from '@mdi/js';
import { Icon } from '@mdi/react';
import InfoIcon from '@mui/icons-material/Info';
import { Card, Chip, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer from 'components/map/MapContainer2';
import { RoleGuard } from 'components/security/Guards';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import { DeletePlanI18N } from 'constants/i18n';
import { attachmentType, focus, ICONS } from 'constants/misc';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import { MapStateContext } from 'contexts/mapContext';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlanDetailsPage from './PlanDetailsPage';
import PlanHeader from './PlanHeader';

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

  const mapContext = useContext(MapStateContext);
  const dialogContext = useContext(DialogContext);

  const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [planWithDetails, setPlanWithDetails] = useState<IGetPlanForViewResponse | null>(null);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

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
      if (attachmentsList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.project.getProjectAttachments(
          planId,
          attachmentType.ATTACHMENTS
        );

        if (!response?.attachmentsList) return;

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.plan, planId, attachmentsList.length]
  );

  useEffect(() => {
    if (!isLoadingPlan && !planWithDetails) {
      getPlan();
      getAttachments(false);
      // getTreatments(false);
      setIsLoadingPlan(true);
    }
  }, [isLoadingPlan, planWithDetails, getPlan, getAttachments]);
  if (!codes.isReady || !codes.codes || !planWithDetails) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

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

  const closeMapDialog = () => {
    setOpenFullScreen(false);
  };

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
                <PlanHeader planWithDetails={planWithDetails} />
                <Paper elevation={2}>
                  <Box p={2}>
                    <Typography variant="h2">Location</Typography>
                  </Box>
                  <Box height={500}>
                    <MapContainer
                      mapId={'plan_location_map'}
                      layerVisibility={mapContext.layerVisibility}
                      features={planWithDetails.location.geometry}
                      mask={null}
                    />
                  </Box>
                </Paper>
                <Box mt={2} />
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
                  <PlanDetailsPage planForViewData={planWithDetails} codes={codes.codes} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>

      <Dialog fullScreen open={openFullScreen} onClose={closeMapDialog}>
        <Box pr={3} pl={1} display="flex" alignItems="center">
          <Box mr={1}>
            <IconButton onClick={closeMapDialog} aria-label="back to plan" size="large">
              <Icon path={mdiArrowLeft} size={1} />
            </IconButton>
          </Box>
        </Box>
        <Box display="flex" height="100%" flexDirection="column">
          <Box flex="1 1 auto">
            <MapContainer
              mapId={'plan_location_map'}
              layerVisibility={mapContext.layerVisibility}
              features={planWithDetails.location.geometry}
            />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default ViewPlanPage;
