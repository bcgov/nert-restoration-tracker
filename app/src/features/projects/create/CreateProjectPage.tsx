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
import { CreateProjectDraftI18N, CreateProjectI18N } from 'constants/i18n';
import { ICONS } from 'constants/misc';
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
  ProjectPartnershipFormInitialValues,
  ProjectPartnershipFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import ProjectRestorationPlanForm, {
  ProjectRestorationPlanFormInitialValues,
  ProjectRestorationPlanFormYupSchema
} from 'features/projects/components/ProjectRestorationPlanForm';
import { Form, Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useQuery } from 'hooks/useQuery';
import { useNertApi } from 'hooks/useNertApi';
import { ICreatePlanRequest } from 'interfaces/usePlanApi.interface';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkFormikErrors } from 'utils/Utils';
import FocalSpeciesComponent, {
  ProjectFocalSpeciesFormInitialValues
} from 'components/species/FocalSpeciesComponent';
import yup, { checkForLocationErrors } from 'utils/YupSchema';
import { useCodesContext } from 'hooks/useContext';

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
  ...ProjectFocalSpeciesFormInitialValues,
  ...ProjectAuthorizationFormInitialValues,
  ...ProjectFundingFormInitialValues,
  ...ProjectPartnershipFormInitialValues,
  ...ProjectLocationFormInitialValues,
  ...ProjectRestorationPlanFormInitialValues
};

export const ProjectFormYupSchema = yup
  .object()
  .concat(ProjectGeneralInformationFormYupSchema)
  .concat(ProjectObjectiveFormYupSchema)
  .concat(ProjectFocusFormYupSchema)
  .concat(ProjectContactYupSchema)
  .concat(ProjectAuthorizationFormYupSchema)
  .concat(ProjectFundingFormYupSchema)
  .concat(ProjectPartnershipFormYupSchema)
  .concat(ProjectLocationFormYupSchema)
  .concat(ProjectRestorationPlanFormYupSchema);

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  const queryParams = useQuery();
  const codes = useCodesContext().codesDataLoader;

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

  const [initialProjectFormData, setInitialProjectFormData] =
    useState<ICreateProjectRequest>(ProjectFormInitialValues);

  // Get draft project fields if draft id exists
  useEffect(() => {
    const getDraftProjectFields = async () => {
      const response = await restorationTrackerApi.draft.getDraft(queryParams.draftId);
      setHasLoadedDraftData(true);

      function instanceOfProjectRequest(
        object: ICreateProjectRequest | ICreatePlanRequest
      ): object is ICreateProjectRequest {
        return 'project' in object;
      }

      if (!response || !response.data || !instanceOfProjectRequest(response.data)) {
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
  };

  const handleCancelConfirmation = () => {
    setOpenYesNoDialog(false);
  };

  const handleSubmitDraft = async (values: IProjectDraftForm) => {
    try {
      const draftId = Number(queryParams.draftId) || draft?.id;

      let response;
      if (draftId) {
        if (formikRef.current) {
          formikRef.current.values.project.state_code = getStateCodeFromLabel(
            StateMachine(true, states.DRAFT, events.saving)
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
            StateMachine(true, states.DRAFT, events.creating)
          );
        }

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
      if (checkForLocationErrors(formikRef, projectPostObject)) {
        return;
      }

      // Remove empty partnerships
      projectPostObject.partnership.partnerships =
        projectPostObject.partnership.partnerships.filter((partner) =>
          partner.partnership_type.trim()
        );

      // Remove empty Authorizations
      projectPostObject.authorization.authorizations =
        projectPostObject.authorization.authorizations.filter((authorization) =>
          authorization.authorization_type.trim()
        );

      // Remove empty Conservation Areas
      projectPostObject.location.conservationAreas =
        projectPostObject.location.conservationAreas.filter((area) => area.conservationArea.trim());

      // Confirm that the project is not a draft
      projectPostObject.restoration_plan.is_project_part_public_plan =
        !!projectPostObject.restoration_plan.is_project_part_public_plan;

      // Set size_ha to 0 if it is not set
      projectPostObject.location.size_ha = projectPostObject.location.size_ha
        ? projectPostObject.location.size_ha
        : 0;

      // Make sure people_involved is a number or null
      projectPostObject.focus.people_involved =
        projectPostObject.focus.people_involved !== 0
          ? Number(projectPostObject.focus.people_involved)
          : null;

      // Set the state code to the correct value for a project being created
      projectPostObject.project.state_code = getStateCodeFromLabel(
        StateMachine(true, states.DRAFT, events.creating)
      );

      // Create the project
      const createProjectResponse =
        await restorationTrackerApi.project.createProject(projectPostObject);

      if (!createProjectResponse?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a project ID.'
        });
        return;
      }

      await deleteDraft();
      setOpenYesNoDialog(false);
      // setEnableCancelCheck(false);
      history(`/admin/projects/${createProjectResponse.id}/details`);
    } catch (error) {
      console.log('error', error);
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

  if (!codes.data) {
    return <CircularProgress className="pageProgress" size={40} aria-label="Loading" />;
  }

  return (
    <>
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

      <YesNoDialog
        dialogTitle="Create Project Confirmation"
        dialogText=""
        dialogTitleBgColor="#E9FBFF"
        dialogContent={
          <>
            <Typography variant="body1" color="textPrimary">
              Please make sure there is no Private Information (PI) in the data. Creating a project
              means it will be published (publicly available). See the{' '}
              <Link
                href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/privacy/personal-information"
                color="primary">
                BC Government PI
              </Link>{' '}
              page for more information.
            </Typography>
            <Typography variant="body1" mt={1} color="textPrimary">
              Are you sure you want to create this project?
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
                dialogTitle: 'Error Creating Project',
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
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component="button"
            tabIndex={0}
            color="primary"
            onClick={handleCancel}
            aria-current="page"
            sx={pageStyles.breadCrumbLink}>
            <ArrowBack color="primary" fontSize="small" sx={pageStyles.breadCrumbLinkIcon} />
            <Typography variant="body2">Cancel and Exit</Typography>
          </Link>
        </Breadcrumbs>
      </Box>

      <Card sx={{ backgroundColor: '#E9FBFF', marginBottom: '0.6rem', marginX: 3 }}>
        <Box mb={3} ml={1}>
          <Box mb={0.5} mt={0.9} data-testid="create_project_header">
            <Typography variant="h1">
              <img src={ICONS.PROJECT_ICON} width="20" height="32" alt="Project" /> Create
              Restoration Project
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Provide the information below and submit to create a new restoration project. * indicate
            required information, while all other fields are preferred.
          </Typography>
        </Box>

        <Box component={Paper} mx={1}>
          <Formik<ICreateProjectRequest>
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={initialProjectFormData}
            validationSchema={ProjectFormYupSchema}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={(values) => handleProjectCreation(values)}>
            <>
              <Form noValidate>
                <Box ml={1}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={2.5}>
                      <Typography variant="h2">General Information</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectGeneralInformationForm />

                      <Grid container spacing={3} direction="column" mb={4}>
                        <ProjectObjectivesForm />
                        <FocalSpeciesComponent />
                        <ProjectFocusForm />
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box ml={1} my={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={2.5}>
                      <Typography variant="h2">Contacts</Typography>
                    </Grid>

                    <Grid item xs={12} md={8.34}>
                      <ProjectContactForm />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box ml={1} my={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={2.5}>
                      <Typography variant="h2">Funding and Partnerships</Typography>
                    </Grid>

                    <Grid item xs={12} md={8.34}>
                      <Box component="fieldset" mx={0}>
                        <ProjectFundingForm />
                      </Box>
                      <Box component="fieldset" mt={4}>
                        <ProjectPartnershipsForm />
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

                    <Grid item xs={12} md={9} mt={-1}>
                      <ProjectAuthorizationForm />
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
                        regions={codes.data.regions.map((item) => {
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
                    data-testid="project-save-draft-button"
                    aria-label="Save Draft">
                    Save Draft
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => setOpenYesNoDialog(true)}
                    data-testid="project-create-button"
                    aria-label="Create Project">
                    <span>Create Project</span>
                  </Button>
                  <Button
                    variant="text"
                    color="primary"
                    size="large"
                    data-testid="project-cancel-buttton"
                    onClick={handleCancel}
                    aria-label="Cancel">
                    Cancel
                  </Button>
                </Box>
              </Form>
            </>
          </Formik>
        </Box>
      </Card>
    </>
  );
};

export default CreateProjectPage;
