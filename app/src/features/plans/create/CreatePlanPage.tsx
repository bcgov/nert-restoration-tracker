import ArrowBack from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import {
  events,
  getStateCodeFromLabel,
  StateMachine,
  states
} from 'components/workflow/StateMachine';
import { CreatePlanDraftI18N, CreatePlanI18N } from 'constants/i18n';
import { ICONS } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import PlanLocationForm, {
  PlanLocationFormInitialValues,
  PlanLocationFormYupSchema
} from 'features/plans/components/PlanLocationForm';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useQuery } from 'hooks/useQuery';
import { useNertApi } from 'hooks/useNertApi';
import { ICreatePlanRequest } from 'interfaces/usePlanApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import yup, { checkForLocationErrors } from 'utils/YupSchema';
import PlanContactForm, {
  PlanContactInitialValues,
  PlanContactYupSchema
} from '../components/PlanContactForm';
import PlanDraftForm, {
  IPlanDraftForm,
  PlanDraftFormInitialValues,
  PlanDraftFormYupSchema
} from '../components/PlanDraftForm';
import PlanFocusForm, {
  PlanFocusFormInitialValues,
  PlanFocusFormYupSchema
} from '../components/PlanFocusForm';
import PlanGeneralInformationForm, {
  PlanGeneralInformationFormInitialValues,
  PlanGeneralInformationFormYupSchema
} from '../components/PlanGeneralInformationForm';
import { useCodesContext } from 'hooks/useContext';
import { checkFormikErrors } from 'utils/Utils';

const pageStyles = {
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

export const PlanFormInitialValues = {
  ...PlanGeneralInformationFormInitialValues,
  ...PlanFocusFormInitialValues,
  ...PlanContactInitialValues,
  ...PlanLocationFormInitialValues
};

export const PlanFormYupSchema = yup
  .object()
  .concat(PlanGeneralInformationFormYupSchema)
  .concat(PlanFocusFormYupSchema)
  .concat(PlanContactYupSchema)
  .concat(PlanLocationFormYupSchema);

/**
 * Page for creating a new Plan.
 *
 * @return {*}
 */
const CreatePlanPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  const queryParams = useQuery();
  const codes = useCodesContext().codesDataLoader;
  const dialogContext = useContext(DialogContext);
  const history = useNavigate();

  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(!queryParams.draftId);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<ICreatePlanRequest>>(null);

  const defaultCancelDialogProps = {
    dialogTitle: CreatePlanI18N.cancelTitle,
    dialogText: CreatePlanI18N.cancelText,
    open: true,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history('/admin/user/projects');
    }
  };

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  // Whether or not to show the 'Save as draft' dialog
  const [openDraftDialog, setOpenDraftDialog] = useState(false);

  // Whether or not to show the creation confirmation Yes/No dialog
  const [openYesNoDialog, setOpenYesNoDialog] = useState(false);

  const [draft, setDraft] = useState({ id: 0, date: '' });

  const [initialPlanFormData, setInitialPlanFormData] =
    useState<ICreatePlanRequest>(PlanFormInitialValues);

  // Get draft Plan fields if draft id exists
  useEffect(() => {
    const getDraftPlanFields = async () => {
      const response = await restorationTrackerApi.draft.getDraft(queryParams.draftId);
      setHasLoadedDraftData(true);

      if (!response || !response.data) {
        return;
      }
      setInitialPlanFormData(response.data);
    };

    if (hasLoadedDraftData) {
      return;
    }

    getDraftPlanFields();
  }, [restorationTrackerApi.draft, hasLoadedDraftData, queryParams.draftId]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    // history('/admin/user/projects');
  };

  const handleCancelConfirmation = () => {
    setOpenYesNoDialog(false);
  };

  const handleSubmitDraft = async (values: IPlanDraftForm) => {
    try {
      const draftId = Number(queryParams.draftId) || draft?.id;

      let response;
      if (draftId) {
        if (formikRef.current) {
          formikRef.current.values.project.state_code = getStateCodeFromLabel(
            StateMachine(false, states.DRAFT, events.saving)
          );
        }
        response = await restorationTrackerApi.draft.updateDraft(
          draftId,
          values.draft_name,
          formikRef.current?.values
        );
      } else {
        if (formikRef.current) {
          formikRef.current.values.project.state_code = getStateCodeFromLabel(
            StateMachine(false, states.DRAFT, events.creating)
          );
        }

        response = await restorationTrackerApi.draft.createDraft(
          false,
          values.draft_name,
          formikRef.current?.values
        );
      }

      setOpenDraftDialog(false);
      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a draft Plan ID.'
        });
        return;
      }

      setDraft({ id: response.id, date: response.date });
      // setEnableCancelCheck(false);

      history('/admin/user/projects');
    } catch (error) {
      setOpenDraftDialog(false);

      const apiError = error as APIError;
      showDraftErrorDialog({
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  /**
   * Handle Plan creation.
   */
  const handlePlanCreation = async (planPostObject: ICreatePlanRequest) => {
    try {
      if (checkForLocationErrors(formikRef, planPostObject)) {
        return;
      }

      planPostObject.location.size_ha = planPostObject.location.size_ha
        ? planPostObject.location.size_ha
        : 0;
      planPostObject.project.state_code = getStateCodeFromLabel(
        StateMachine(true, states.DRAFT, events.creating)
      );

      const response = await restorationTrackerApi.plan.createPlan(planPostObject);
      if (!response?.project_id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a Plan ID.'
        });
        return;
      }

      await deleteDraft();
      setOpenYesNoDialog(false);
      // setEnableCancelCheck(false);
      history(`/admin/Plans/${response.project_id}`);
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Plan',
        dialogError: (error as APIError)?.message,
        dialogErrorDetails: (error as APIError)?.errors
      });
      setOpenYesNoDialog(false);
    }
  };

  /**
   * Deletes the draft record used when creating this Plan, if one exists.
   *
   * @param {number} draftId
   * @returns {*}
   */
  const deleteDraft = async () => {
    const draftId = Number(queryParams.draftId);

    if (!draftId) {
      return;
    }

    try {
      await restorationTrackerApi.draft.deleteDraft(draftId);
    } catch (error) {
      return error;
    }
  };

  const showDraftErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreatePlanDraftI18N.draftErrorTitle,
      dialogText: CreatePlanDraftI18N.draftErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreatePlanI18N.createErrorTitle,
      dialogText: CreatePlanI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  if (!codes.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <EditDialog
        dialogTitle="Save Incomplete Plan as a Draft"
        dialogSaveButtonLabel="Save"
        open={openDraftDialog}
        component={{
          element: <PlanDraftForm />,
          initialValues: {
            draft_name: formikRef.current
              ? formikRef.current.values.project.project_name
              : PlanDraftFormInitialValues.draft_name
          },
          validationSchema: PlanDraftFormYupSchema
        }}
        onCancel={() => setOpenDraftDialog(false)}
        onSave={handleSubmitDraft}
      />

      <YesNoDialog
        dialogTitle="Create Plan Confirmation"
        dialogText=""
        dialogTitleBgColor="#E9FBFF"
        dialogContent={
          <>
            <Typography variant="body1" color="textPrimary">
              Please make sure there is no Private Information (PI) in the data. Creating a Plan
              means it will be published (publicly available). See the{' '}
              <Link
                href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/privacy/personal-information"
                color="primary">
                BC Government PI
              </Link>{' '}
              page for more information.
            </Typography>
            <Typography variant="body1" mt={1} color="textPrimary">
              Are you sure you want to create this Plan?
            </Typography>
          </>
        }
        open={openYesNoDialog}
        onClose={handleCancelConfirmation}
        onNo={handleCancelConfirmation}
        onYes={() => {
          setOpenYesNoDialog(false);
          formikRef.current?.validateForm().then((errors) => {
            const errorsText: string[] = checkFormikErrors(errors);

            if (errorsText.length) {
              dialogContext.setErrorDialog({
                dialogTitle: 'Error Creating Plan',
                dialogText: 'Please correct the errors in the form before submitting.',
                dialogError: 'The following errors were found:',
                dialogErrorDetails: errorsText,
                ...defaultErrorDialogProps,
                open: true
              });
            }
          });

          formikRef.current?.submitForm();
        }}
      />

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
          <Box mb={0.5} mt={0.9} data-testid="create_plan_header">
            <Typography variant="h1">
              <img src={ICONS.PLAN_ICON} width="20" height="32" alt="Plan" /> Create Restoration
              Plan
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Provide the information below and submit to create a new restoration plan. * indicate
            required information, while all other fields are preferred.
          </Typography>
        </Box>

        <Box component={Paper} mx={1}>
          <Formik<ICreatePlanRequest>
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={initialPlanFormData}
            validationSchema={PlanFormYupSchema}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={handlePlanCreation}>
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
                      regions={codes.data.regions.map((item) => {
                        return { value: item.id, label: item.name };
                      })}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box my={2} sx={pageStyles.formButtons} display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => setOpenDraftDialog(true)}
                  data-testid="Plan-save-draft-button">
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setOpenYesNoDialog(true)}
                  data-testid="plan-create-button">
                  <span>Create Plan</span>
                </Button>
                <Button
                  variant="text"
                  color="primary"
                  size="large"
                  data-testid="Plan-cancel-buttton"
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

export default CreatePlanPage;
