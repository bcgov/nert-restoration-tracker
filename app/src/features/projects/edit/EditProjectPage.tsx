import ArrowBack from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditProjectI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import ProjectAuthorizationForm from 'features/projects/components/ProjectAuthorizationForm';
import ProjectContactForm from 'features/projects/components/ProjectContactForm';
import ProjectFundingForm from 'features/projects/components/ProjectFundingForm';
import ProjectGeneralInformationForm from 'features/projects/components/ProjectGeneralInformationForm';
import ProjectLocationForm from 'features/projects/components/ProjectLocationForm';
import ProjectPartnershipsForm from 'features/projects/components/ProjectPartnershipsForm';
import {
  ProjectFormInitialValues,
  ProjectFormYupSchema
} from 'features/projects/create/CreateProjectPage';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IEditProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectObjectivesForm from '../components/ProjectObjectivesForm';
import ProjectFocusForm from '../components/ProjectFocusForm';
import ProjectWildlifeForm from '../components/ProjectWildlifeForm';
import { handleFocusFormValues } from 'utils/Utils';
import ProjectRestorationPlanForm from '../components/ProjectRestorationPlanForm';

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

/**
 * Page for editing a project.
 *
 * @return {*}
 */
const EditProjectPage: React.FC = () => {
  const history = useNavigate();
  const dialogContext = useContext(DialogContext);
  const codes = useCodes();

  const restorationTrackerApi = useRestorationTrackerApi();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);

  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(false);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<IEditProjectRequest>>(null);

  const [initialProjectFormData, setInitialProjectFormData] = useState<IEditProjectRequest>(
    ProjectFormInitialValues as unknown as IEditProjectRequest
  );

  useEffect(() => {
    const getEditProjectFields = async () => {
      const response = await restorationTrackerApi.project.getProjectByIdForEdit(projectId);

      const focus = handleFocusFormValues(response.project);

      // Merge the response with the initial form data
      const editProject = {
        ...response,
        focus: {
          focuses: focus,
          people_involved: response.project.people_involved
        },
        restoration_plan: {
          is_project_part_public_plan: Boolean(response.project.is_project_part_public_plan)
        },
        location: {
          ...response.location,
          is_within_overlapping: response.location.is_within_overlapping === 'Y' ? 'true' : 'false'
        }
      };

      setInitialProjectFormData(editProject);

      if (!response || !response.project.project_id) {
        return;
      }

      setHasLoadedDraftData(true);
    };

    if (hasLoadedDraftData) {
      return;
    }

    getEditProjectFields();
  }, [hasLoadedDraftData, restorationTrackerApi.project, urlParams]);

  /**
   * Handle project edits.
   */
  const handleProjectEdits = async (values: IEditProjectRequest) => {
    // Remove empty partnerships
    values.partnership.partnerships = values.partnership.partnerships.filter((partner) =>
      partner.partnership.trim()
    );

    // Remove empty Authorizations
    values.authorization.authorizations = values.authorization.authorizations.filter(
      (authorization) => authorization.authorization_type.trim()
    );

    // Set size_ha to 0 if it is not set
    values.location.size_ha = values.location.size_ha ? values.location.size_ha : 0;

    try {
      const response = await restorationTrackerApi.project.updateProject(projectId, values);

      if (!response?.id) {
        showEditErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a project ID.'
        });
        return;
      }

      history(`/admin/projects/${response.id}`);
    } catch (error) {
      showEditErrorDialog({
        dialogTitle: 'Error Editing Project',
        dialogError: (error as APIError)?.message,
        dialogErrorDetails: (error as APIError)?.errors
      });
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
      history(`/admin/projects/${projectId}`);
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

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
  };

  if (!codes.codes || !hasLoadedDraftData) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Container maxWidth="xl">
        <Box mb={3}>
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

        <Box mb={5}>
          <Box mb={1}>
            <Typography variant="h1">Edit Restoration Project</Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Configure and submit updated restoration project
          </Typography>
        </Box>

        <Box component={Paper} p={4}>
          <Formik<IEditProjectRequest>
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={initialProjectFormData}
            validationSchema={ProjectFormYupSchema}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={handleProjectEdits}>
            <>
              <Box my={5}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
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

              <Box my={5}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h2">Contacts</Typography>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <ProjectContactForm />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box ml={1} my={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2.5}>
                    <Typography variant="h2">Actions Beneficial to Wildlife and/or Fish</Typography>
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

              <Box my={5}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h2">Authorizations</Typography>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <ProjectAuthorizationForm />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box my={5}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h2">Funding and Partnerships</Typography>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <Box component="fieldset" mx={0}>
                      <ProjectFundingForm />
                    </Box>
                    <Box component="fieldset" mt={5} mx={0}>
                      <Typography component="legend">Partnerships</Typography>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          List any partnerships that are involved in this project.
                        </Typography>
                        <ProjectPartnershipsForm />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box my={5}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
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

              <Box mt={5} sx={pageStyles.formButtons} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  onClick={() => formikRef.current?.submitForm()}
                  data-testid="project-save-button">
                  Save Project
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
            </>
          </Formik>
        </Box>
      </Container>
    </>
  );
};

export default EditProjectPage;
