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
import { ICONS } from 'constants/misc';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditProjectI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import ProjectAuthorizationForm, {
  ProjectAuthorizationFormArrayItemInitialValues
} from 'features/projects/components/ProjectAuthorizationForm';
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
import { useNertApi } from 'hooks/useNertApi';
import { IEditProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectObjectivesForm from '../components/ProjectObjectivesForm';
import ProjectFocusForm from '../components/ProjectFocusForm';
import { checkFormikErrors, handleFocusFormValues, handlePartnershipRefValues } from 'utils/Utils';
import ProjectRestorationPlanForm from '../components/ProjectRestorationPlanForm';
import FocalSpeciesComponent from 'components/species/FocalSpeciesComponent';
import { checkForLocationErrors } from 'utils/YupSchema';
import { useCodesContext } from 'hooks/useContext';
import YesNoDialog from 'components/dialog/YesNoDialog';

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
  const codes = useCodesContext().codesDataLoader.data;

  const restorationTrackerApi = useNertApi();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);

  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(false);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<IEditProjectRequest>>(null);

  const [initialProjectFormData, setInitialProjectFormData] = useState<IEditProjectRequest>(
    ProjectFormInitialValues as unknown as IEditProjectRequest
  );

  // Whether or not to show the creation confirmation Yes/No dialog
  const [openYesNoDialog, setOpenYesNoDialog] = useState(false);

  const getSpecies = async (tsns: number[]) => {
    if (!tsns || tsns.length === 0) {
      return [];
    }

    const speciesData = await restorationTrackerApi.taxonomy.getSpeciesFromIds(tsns);
    return speciesData;
  };

  useEffect(() => {
    const getEditProjectFields = async () => {
      if (!codes) {
        return;
      }

      const response = await restorationTrackerApi.project.getProjectByIdForEdit(projectId);

      const focus = handleFocusFormValues(response.project);

      const speciesData = await getSpecies(response.species.focal_species);

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
          region: response.location.region || '',
          is_within_overlapping:
            response.location.is_within_overlapping === 'D'
              ? 'dont_know'
              : response.location.is_within_overlapping === 'Y'
                ? 'true'
                : 'false'
        },
        species: {
          focal_species: speciesData
        },
        partnership: {
          partnerships: response.partnership.partnerships.map((partner) => {
            const partnerType = codes?.partnership_type.find(
              (type) => type.id === Number(partner.partnership_type)
            );

            const partnerRef = handlePartnershipRefValues(
              partnerType,
              partner.partnership_ref,
              codes
            );

            return {
              partnership_type: partnerType?.name || '',
              partnership_ref: partnerRef,
              partnership_name: partner.partnership_name || ''
            };
          })
        }
      };

      if (editProject.authorization.authorizations.length === 0) {
        editProject.authorization.authorizations = [ProjectAuthorizationFormArrayItemInitialValues];
      }

      if (editProject.partnership.partnerships.length === 0) {
        editProject.partnership.partnerships = [];
      }

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
  }, [hasLoadedDraftData, restorationTrackerApi.project, urlParams, codes]);

  const handleCancelConfirmation = () => {
    setOpenYesNoDialog(false);
  };

  /**
   * Handle project edits.
   */
  const handleProjectEdits = async (values: IEditProjectRequest) => {
    if (checkForLocationErrors(formikRef, values)) {
      return;
    }
    // Remove empty partnerships
    values.partnership.partnerships = values.partnership.partnerships.filter((partner) =>
      partner.partnership_type.trim()
    );

    // Remove empty Authorizations
    values.authorization.authorizations = values.authorization.authorizations.filter(
      (authorization) => authorization.authorization_type.trim()
    );

    // Remove empty Conservation Areas
    values.location.conservationAreas = values.location.conservationAreas.filter((area) =>
      area.conservationArea.trim()
    );

    // Set size_ha to 0 if it is not set
    values.location.size_ha = values.location.size_ha ? values.location.size_ha : 0;

    // Set restoration_plan in project object to be saved
    values.project.is_project_part_public_plan =
      values.restoration_plan.is_project_part_public_plan;

    // Make sure people_involved is a number or null
    values.focus.people_involved =
      values.focus.people_involved !== 0 ? Number(values.focus.people_involved) : null;

    try {
      const response = await restorationTrackerApi.project.updateProject(projectId, values);

      if (!response?.id) {
        showEditErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a project ID.'
        });
        return;
      }

      history(`/admin/projects/${response.id}/details`);
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
      history(`/admin/projects/${urlParams['id']}/details`);
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

  if (!codes || !hasLoadedDraftData) {
    return <CircularProgress className="pageProgress" size={40} aria-label="Loading" />;
  }

  return (
    <>
      <YesNoDialog
        dialogTitle="Save Project Confirmation"
        dialogText=""
        dialogTitleBgColor="#E9FBFF"
        dialogContent={
          <>
            <Typography variant="body1" color="textPrimary">
              Please make sure there is no Private Information (PI) in the data. Saving a project
              means it will be published (publicly available). See the{' '}
              <Link
                href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/privacy/personal-information"
                color="primary">
                BC Government PI
              </Link>{' '}
              page for more information.
            </Typography>
            <Typography variant="body1" mt={1} color="textPrimary">
              Are you sure you want to save the project?
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
                dialogTitle: 'Error Saving Project',
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

      <Card
        sx={{ backgroundColor: '#E9FBFF', marginBottom: '0.6rem', marginX: 3 }}
        role="region"
        aria-labelledby="edit_project_header">
        <Box mb={3} ml={1}>
          <Box mb={0.5} mt={0.9}>
            <Typography variant="h1" data-testid="edit_project_header" id="edit_project_header">
              <img src={ICONS.PROJECT_ICON} width="20" height="32" alt="Plan" /> Edit Restoration
              Project
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Configure and submit updated restoration project
          </Typography>
        </Box>

        <Box component={Paper} mx={1}>
          <Formik<IEditProjectRequest>
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={initialProjectFormData}
            validationSchema={ProjectFormYupSchema}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={handleProjectEdits}>
            <>
              <Box ml={1} my={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2.5}>
                    <Typography variant="h2">General Information</Typography>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <ProjectGeneralInformationForm
                      currentStateCode={initialProjectFormData.project.state_code}
                    />

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
                    <Typography variant="h2">Location</Typography>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <ProjectLocationForm
                      regions={codes.regions.map((item) => {
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
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  onClick={() => setOpenYesNoDialog(true)}
                  data-testid="project-save-button"
                  aria-label="Save Project">
                  Save Project
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
            </>
          </Formik>
        </Box>
      </Card>
    </>
  );
};

export default EditProjectPage;
