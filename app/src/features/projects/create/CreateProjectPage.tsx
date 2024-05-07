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
// import { ScrollToFormikError } from 'components/formik/ScrollToFormikError';
import {
  events,
  getStateCodeFromLabel,
  StateMachine,
  states
} from 'components/workflow/StateMachine';
import { CreateProjectDraftI18N, CreateProjectI18N } from 'constants/i18n';
import { ICONS } from 'constants/misc';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import ProjectAuthorizationForm, {
  ProjectAuthorizationFormInitialValues,
  ProjectAuthorizationFormYupSchema
} from 'features/projects/components/ProjectAuthorizationForm';
import ProjectContactForm, {
  ProjectContactInitialValues,
  ProjectContactYupSchema
} from 'features/projects/components/ProjectContactForm';
import ProjectDraftForm, {
  IProjectDraftForm,
  ProjectDraftFormInitialValues,
  ProjectDraftFormYupSchema
} from 'features/projects/components/ProjectDraftForm';
import ProjectFocusForm, {
  ProjectFocusFormInitialValues,
  ProjectFocusFormYupSchema
} from 'features/projects/components/ProjectFocusForm';
import ProjectFundingForm, {
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from 'features/projects/components/ProjectFundingForm';
import ProjectGeneralInformationForm, {
  ProjectGeneralInformationFormInitialValues,
  ProjectGeneralInformationFormYupSchema
} from 'features/projects/components/ProjectGeneralInformationForm';
import ProjectLocationForm, {
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import ProjectObjectivesForm, {
  ProjectObjectiveFormInitialValues,
  ProjectObjectiveFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import ProjectPartnershipsForm, {
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import ProjectRestorationPlanForm, {
  ProjectRestorationPlanFormInitialValues,
  ProjectRestorationPlanFormYupSchema
} from 'features/projects/components/ProjectRestorationPlanForm';
import ProjectWildlifeForm, {
  ProjectIUCNFormYupSchema,
  ProjectWildlifeFormInitialValues
} from 'features/projects/components/ProjectWildlifeForm';
import { Form, Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useQuery } from 'hooks/useQuery';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { ICreateProjectRequest } from 'interfaces/useProjectPlanApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import yup from 'utils/YupSchema';
// import YesNoDialog from 'components/dialog/YesNoDialog'

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

export const ProjectFormInitialValues = {
  ...ProjectGeneralInformationFormInitialValues,
  ...ProjectObjectiveFormInitialValues,
  ...ProjectFocusFormInitialValues,
  ...ProjectContactInitialValues,
  ...ProjectWildlifeFormInitialValues,
  ...ProjectAuthorizationFormInitialValues,
  ...ProjectFundingFormInitialValues,
  ...ProjectPartnershipsFormInitialValues,
  ...ProjectLocationFormInitialValues,
  ...ProjectRestorationPlanFormInitialValues
};

export const ProjectFormYupSchema = yup
  .object()
  .concat(ProjectGeneralInformationFormYupSchema)
  .concat(ProjectObjectiveFormYupSchema)
  .concat(ProjectFocusFormYupSchema)
  .concat(ProjectContactYupSchema)
  .concat(ProjectIUCNFormYupSchema)
  .concat(ProjectAuthorizationFormYupSchema)
  .concat(ProjectFundingFormYupSchema)
  .concat(ProjectPartnershipsFormYupSchema)
  .concat(ProjectLocationFormYupSchema)
  .concat(ProjectRestorationPlanFormYupSchema);

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const restorationTrackerApi = useRestorationTrackerApi();
  const queryParams = useQuery();
  const codes = useCodes();

  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(!queryParams.draftId);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<ICreateProjectRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  // const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const history = useNavigate();
  const defaultCancelDialogProps = {
    dialogTitle: CreateProjectI18N.cancelTitle,
    dialogText: CreateProjectI18N.cancelText,
    open: false,
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

  const [draft, setDraft] = useState({ id: 0, date: '' });

  const [initialProjectFormData, setInitialProjectFormData] =
    useState<ICreateProjectRequest>(ProjectFormInitialValues);

  // Get draft project fields if draft id exists
  useEffect(() => {
    const getDraftProjectFields = async () => {
      const response = await restorationTrackerApi.draft.getDraft(queryParams.draftId);
      setHasLoadedDraftData(true);

      if (!response || !response.data) {
        return;
      }

      setInitialProjectFormData(response.data);
    };

    if (hasLoadedDraftData) {
      return;
    }

    getDraftProjectFields();
  }, [restorationTrackerApi.draft, hasLoadedDraftData, queryParams.draftId]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history('/admin/user/projects');
  };

  const handleSubmitDraft = async (values: IProjectDraftForm) => {
    try {
      const draftId = Number(queryParams.draftId) || draft?.id;

      let response;
      if (draftId) {
        if (formikRef.current)
          formikRef.current.values.project.state_code = getStateCodeFromLabel(
            StateMachine(true, states.DRAFT, events.saving)
          );
        response = await restorationTrackerApi.draft.updateDraft(
          draftId,
          values.draft_name,
          formikRef.current?.values
        );
      } else {
        if (formikRef.current)
          formikRef.current.values.project.state_code = getStateCodeFromLabel(
            StateMachine(true, states.DRAFT, events.creating)
          );

        response = await restorationTrackerApi.draft.createDraft(
          true,
          values.draft_name,
          formikRef.current?.values
        );
      }

      setOpenDraftDialog(false);
      if (!response?.id) {
        showCreateErrorDialog({
          dialogError:
            'The response from the server was null, or did not contain a draft project ID.'
        });
        return;
      }

      setDraft({ id: response.id, date: response.date });
      // setEnableCancelCheck(false);
      keycloakWrapper?.refresh();
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
   * Handle project creation.
   */
  const handleProjectCreation = async (projectPostObject: ICreateProjectRequest) => {
    try {
      projectPostObject.project.state_code = getStateCodeFromLabel(
        StateMachine(true, states.DRAFT, events.creating)
      );
      const response = await restorationTrackerApi.project.createProject(projectPostObject);
      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a project ID.'
        });
        return;
      }

      await deleteDraft();

      // setEnableCancelCheck(false);
      keycloakWrapper?.refresh();
      history(`/admin/projects/${response.id}`);
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Project',
        dialogError: (error as APIError)?.message,
        dialogErrorDetails: (error as APIError)?.errors
      });
    }
  };

  /**
   * Deletes the draft record used when creating this project, if one exists.
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
      dialogTitle: CreateProjectDraftI18N.draftErrorTitle,
      dialogText: CreateProjectDraftI18N.draftErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateProjectI18N.createErrorTitle,
      dialogText: CreateProjectI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  if (!codes.codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  // /**
  //  * Intercepts all navigation attempts (when used with a `Prompt`).
  //  *
  //  * Returning true allows the navigation, returning false prevents it.
  //  *
  //  * @param {History.Location} location
  //  * @return {*}
  //  */
  // const handleLocationChange = () => {
  //   if (!dialogContext.yesNoDialogProps.open) {
  //     // If the cancel dialog is not open: open it
  //     dialogContext.setYesNoDialog({
  //       ...defaultCancelDialogProps,
  //       onYes: () => {
  //         dialogContext.setYesNoDialog({ open: false });
  //         history(location.pathname);
  //       },
  //       open: true
  //     });
  //     return false;
  //   }

  //   // If the cancel dialog is already open and another location change action is triggered: allow it
  //   return true;
  // };

  return (
    <>
      {/* <ReactRouterPrompt when={enableCancelCheck} >
        {({ isActive, onConfirm, onCancel }) => (
          <YesNoDialog dialogTitle="Cancel Create Project" dialogText="Are you sure you want to cancel?" open={isActive} onClose={onCancel} onNo={onCancel} onYes={onConfirm} />
        )}
      </ReactRouterPrompt> */}

      <EditDialog
        dialogTitle="Save Incomplete Project as a Draft"
        dialogSaveButtonLabel="Save"
        open={openDraftDialog}
        component={{
          element: <ProjectDraftForm />,
          initialValues: {
            draft_name: formikRef.current
              ? formikRef.current.values.project.project_name
              : ProjectDraftFormInitialValues.draft_name
          },
          validationSchema: ProjectDraftFormYupSchema
        }}
        onCancel={() => setOpenDraftDialog(false)}
        onSave={handleSubmitDraft}
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

      {/* <Container maxWidth="xl"> */}
      <Card sx={{ backgroundColor: '#E9FBFF', marginBottom: '0.6rem', marginX: 3 }}>
        <Box mb={3} ml={1}>
          <Box mb={0.5} mt={0.9}>
            <Typography variant="h1">
              <img src={ICONS.PROJECT_ICON} width="20" height="32" alt="Project" /> Create
              Restoration Project
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Configure and submit a new restoration project
          </Typography>
        </Box>

        <Box component={Paper} mx={1}>
          <Formik<ICreateProjectRequest>
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={initialProjectFormData}
            validationSchema={ProjectFormYupSchema}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={handleProjectCreation}>
            <>
              {/* <ScrollToFormikError /> */}
              <Form noValidate>
                <Box ml={1}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={2.5}>
                      <Typography variant="h2">General Information</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectGeneralInformationForm />
                      <Box component="fieldset" my={2} mx={0}>
                        <ProjectObjectivesForm />
                      </Box>
                      <ProjectFocusForm />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box ml={1} my={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={2.5}>
                      <Typography variant="h2">Contacts</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectContactForm
                        coordinator_agency={codes.codes.coordinator_agency.map((item) => item.name)}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box ml={1} my={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={2.5}>
                      <Typography variant="h2">
                        Actions Beneficial to Wildlife and/or Fish
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <Box component="fieldset" mx={0}>
                        <ProjectWildlifeForm
                          classifications={
                            codes.codes.iucn_conservation_action_level_1_classification?.map(
                              (item) => {
                                return { value: item.id, label: item.name };
                              }
                            ) || []
                          }
                          subClassifications1={
                            codes.codes.iucn_conservation_action_level_2_subclassification?.map(
                              (item) => {
                                return {
                                  value: item.id,
                                  iucn1_id: item.iucn1_id,
                                  label: item.name
                                };
                              }
                            ) || []
                          }
                          subClassifications2={
                            codes.codes.iucn_conservation_action_level_3_subclassification?.map(
                              (item) => {
                                return {
                                  value: item.id,
                                  iucn2_id: item.iucn2_id,
                                  label: item.name
                                };
                              }
                            ) || []
                          }
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box ml={1} my={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={2.5}>
                      <Typography variant="h2">Authorizations</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectAuthorizationForm />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box ml={1} my={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={2.5}>
                      <Typography variant="h2">Funding and Partnerships</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <Box component="fieldset" mx={0}>
                        <ProjectFundingForm
                          fundingSources={codes.codes.funding_source.map((item) => {
                            return { value: item.id, label: item.name };
                          })}
                          investment_action_category={codes.codes.investment_action_category.map(
                            (item) => {
                              return { value: item.id, label: item.name, fs_id: item.fs_id };
                            }
                          )}
                        />
                      </Box>

                      <Box component="fieldset" mt={4} mx={0}>
                        <ProjectPartnershipsForm />
                      </Box>
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
                      <ProjectLocationForm
                        regions={codes.codes.regions.map((item) => {
                          return { value: item.id, label: item.name };
                        })}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box ml={1} mt={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="h2">Restoration Plan</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectRestorationPlanForm />
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
                    data-testid="project-save-draft-button">
                    Save Draft
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    // onClick={() => formikRef.current?.submitForm()}
                    data-testid="project-create-button">
                    <span>Create Project</span>
                  </Button>
                  <Button
                    variant="text"
                    color="primary"
                    size="large"
                    data-testid="project-cancel-buttton"
                    onClick={handleCancel}>
                    Cancel
                  </Button>
                </Box>
              </Form>
            </>
          </Formik>
        </Box>
        {/* </Container> */}
      </Card>
    </>
  );
};

export default CreateProjectPage;
