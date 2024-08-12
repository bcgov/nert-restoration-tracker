import ArrowBack from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditProjectI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useNertApi } from 'hooks/useNertApi';
import { IEditPlanRequest } from 'interfaces/usePlanApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import yup, { checkForLocationErrors } from 'utils/YupSchema';
import { ICONS } from 'constants/misc';
import PlanContactForm, { PlanContactYupSchema } from '../components/PlanContactForm';
import PlanGeneralInformationForm, {
  PlanGeneralInformationFormYupSchema
} from '../components/PlanGeneralInformationForm';
import PlanLocationForm, { PlanLocationFormYupSchema } from '../components/PlanLocationForm';
import { PlanFormInitialValues } from '../create/CreatePlanPage';
import PlanFocusForm from '../components/PlanFocusForm';
import { handleFocusFormValues } from 'utils/Utils';

const pageStyles = {
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  formButtons: {
    '& button': {
      margin: '0.5rem'
    }
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  }
};

export const PlanEditFormYupSchema = yup
  .object()
  .concat(PlanGeneralInformationFormYupSchema)
  .concat(PlanContactYupSchema)
  .concat(PlanLocationFormYupSchema);

/**
 * Page for editing a plan.
 *
 * @return {*}
 */
const EditPlanPage: React.FC = () => {
  const history = useNavigate();

  const restorationTrackerApi = useNertApi();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);

  const codes = useCodes();

  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(false);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<IEditPlanRequest>>(null);

  const dialogContext = useContext(DialogContext);

  const [initialPlanFormData, setInitialPlanFormData] =
    useState<IEditPlanRequest>(PlanFormInitialValues);

  useEffect(() => {
    const getEditPlanFields = async () => {
      const response = await restorationTrackerApi.plan.getPlanByIdForUpdate(projectId);

      const editPlan = {
        ...response,
        location: {
          ...response.location,
          region: response.location.region || ''
        },
        focus: { focuses: handleFocusFormValues(response.project) }
      };

      setInitialPlanFormData(editPlan);

      if (!response || !response.project.project_id) {
        return;
      }

      setHasLoadedDraftData(true);
    };

    if (hasLoadedDraftData) {
      return;
    }

    getEditPlanFields();
  }, [hasLoadedDraftData, restorationTrackerApi.plan, urlParams]);

  /**
   * Handle project edits.
   */
  const handlePlanEdits = async (values: IEditPlanRequest) => {
    try {
      if (checkForLocationErrors(formikRef, values)) {
        return;
      }

      const response = await restorationTrackerApi.plan.updatePlan(projectId, values);

      if (!response?.project_id) {
        showEditErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a project ID.'
        });
        return;
      }

      history(`/admin/plans/${urlParams['id']}/details`);
    } catch (error) {
      showEditErrorDialog({
        dialogTitle: 'Error Editing Project',
        dialogError: (error as APIError)?.message,
        dialogErrorDetails: (error as APIError)?.errors
      });
    }
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
  };

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const defaultCancelDialogProps = {
    dialogTitle: EditProjectI18N.cancelTitle,
    dialogText: EditProjectI18N.cancelText,
    open: true,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history(`/admin/plans/${urlParams['id']}/details`);
    }
  };

  const showEditErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: EditProjectI18N.editErrorTitle,
      dialogText: EditProjectI18N.editErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  if (!codes.codes || !hasLoadedDraftData) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Box mb={1} ml={3}>
        <Breadcrumbs>
          <Link
            color="primary"
            onClick={handleCancel}
            aria-current="page"
            sx={pageStyles.breadCrumbLink}>
            <ArrowBack color="primary" fontSize="small" sx={pageStyles.breadCrumbLinkIcon} />
            <Typography variant="body2">Cancel and Exit</Typography>
          </Link>
        </Breadcrumbs>
      </Box>

      <Card sx={{ backgroundColor: '#FFF4EB', marginBottom: '0.6rem', marginX: 3 }}>
        <Box mb={3} ml={1}>
          <Box mb={0.5} mt={0.9}>
            <Typography variant="h1">
              <img src={ICONS.PLAN_ICON} width="20" height="32" alt="Plan" /> Edit Restoration Plan
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Configure and submit updated restoration plan
          </Typography>
        </Box>

        <Box component={Paper} mx={1}>
          <Formik<IEditPlanRequest>
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={initialPlanFormData}
            validationSchema={PlanEditFormYupSchema}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={handlePlanEdits}>
            <>
              <Box ml={1} my={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2.5}>
                    <Typography variant="h2">General Information</Typography>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <PlanGeneralInformationForm />
                    <Box mt={2}>
                      <PlanFocusForm />
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box ml={1} my={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2.5}>
                    <Typography variant="h2">Contacts</Typography>
                  </Grid>

                  <Grid item xs={12} md={8.57}>
                    <PlanContactForm />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box ml={1} my={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={2.5}>
                    <Typography variant="h2">Location</Typography>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <PlanLocationForm
                      regions={codes.codes.regions.map((item) => {
                        return { value: item.id, label: item.name };
                      })}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box my={2} sx={pageStyles.formButtons} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  onClick={() => formikRef.current?.submitForm()}
                  data-testid="plan-save-button">
                  Save Plan
                </Button>
                <Button
                  variant="text"
                  color="primary"
                  size="large"
                  data-testid="plan-cancel-buttton"
                  onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </>
          </Formik>
        </Box>
      </Card>
    </>
  );
};

export default EditPlanPage;
