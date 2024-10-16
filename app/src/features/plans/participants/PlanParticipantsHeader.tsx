import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useNertApi } from 'hooks/useNertApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AddProjectParticipantsForm, {
  AddProjectParticipantsFormInitialValues,
  AddProjectParticipantsFormYupSchema,
  IAddPlanParticipantsForm
} from './AddPlanParticipantsForm';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';

export interface IPlanParticipantsHeaderProps {
  planWithDetails: IGetPlanForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project Participant header for a single-project view.
 *
 * @param {*} props
 * @return {*}
 */
const PlanParticipantsHeader: React.FC<IPlanParticipantsHeaderProps> = (props) => {
  const history = useNavigate();
  const urlParams: Record<string, string | number | undefined> = useParams();
  const dialogContext = useContext(DialogContext);
  const restorationTrackerApi = useNertApi();

  const [openAddParticipantsDialog, setOpenAddParticipantsDialog] = useState(false);

  const planId = Number(urlParams['id']);

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false })
  };

  const openErrorDialog = (errorDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      ...defaultErrorDialogProps,
      ...errorDialogProps,
      open: true
    });
  };

  const handleAddPlanParticipantsSave = async (values: IAddPlanParticipantsForm) => {
    try {
      const response = await restorationTrackerApi.project.addProjectParticipants(
        planId,
        values.participants
      );

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.addParticipantsErrorTitle,
          dialogText: ProjectParticipantsI18N.addParticipantsErrorText
        });
        return;
      }

      props.refresh();
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.addParticipantsErrorTitle,
        dialogText: ProjectParticipantsI18N.addParticipantsErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  return (
    <>
      <Container maxWidth="xl" role="main" aria-labelledby="plan-participants-header-title">
        <Box pb={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="primary" onClick={() => history('/admin/plans')} aria-current="page">
              <Typography variant="body2">Plans</Typography>
            </Link>
            <Link
              color="primary"
              onClick={() => history(`/admin/plans/${props.planWithDetails.project.project_id}`)}
              aria-current="page">
              <Typography variant="body2">{props.planWithDetails.project.project_name}</Typography>
            </Link>
            <Typography variant="body2">Plan Team</Typography>
          </Breadcrumbs>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={5}>
          <Typography variant="h1" id="plan-participants-header-title">
            Plan Team
          </Typography>
          <Box ml={4}>
            <Button
              color="primary"
              variant="contained"
              data-testid="invite-project-users-button"
              aria-label="Add Team Members"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => setOpenAddParticipantsDialog(true)}>
              Add Team Members
            </Button>
          </Box>
        </Box>
      </Container>

      <EditDialog
        dialogTitle="Add Team Members"
        open={openAddParticipantsDialog}
        dialogSaveButtonLabel="Add"
        component={{
          element: (
            <AddProjectParticipantsForm
              project_roles={
                props.codes?.project_roles?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: AddProjectParticipantsFormInitialValues,
          validationSchema: AddProjectParticipantsFormYupSchema
        }}
        onCancel={() => setOpenAddParticipantsDialog(false)}
        onSave={(values) => {
          handleAddPlanParticipantsSave(values);
          setOpenAddParticipantsDialog(false);
          dialogContext.setSnackbar({
            open: true,
            snackbarMessage: (
              <Typography variant="body2" component="div">
                {values.participants.length} team{' '}
                {values.participants.length > 1 ? 'members' : 'member'} added.
              </Typography>
            )
          });
        }}
      />
    </>
  );
};

export default PlanParticipantsHeader;
