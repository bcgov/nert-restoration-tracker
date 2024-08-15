import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { AccessRequestI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { Formik } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useNertApi } from 'hooks/useNertApi';
import {
  IBCeIDBasicAccessRequestDataObject,
  IBCeIDBusinessAccessRequestDataObject,
  IIDIRAccessRequestDataObject
} from 'interfaces/useAdminApi.interface';
import React, { ReactElement, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BCeIDRequestForm, {
  BCeIDBasicRequestFormInitialValues,
  BCeIDBasicRequestFormYupSchema,
  BCeIDBusinessRequestFormInitialValues,
  BCeIDBusinessRequestFormYupSchema
} from './BCeIDRequestForm';
import IDIRRequestForm, {
  IDIRRequestFormInitialValues,
  IDIRRequestFormYupSchema
} from './IDIRRequestForm';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useCodesContext } from 'hooks/useContext';

const pageStyles = {
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
};

/**
 * Access Request form
 *
 * @return {*}
 */
export const AccessRequestPage: React.FC = () => {
  const nertApi = useNertApi();
  const history = useNavigate();

  const authStateContext = useAuthStateContext();

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: AccessRequestI18N.requestTitle,
    dialogText: AccessRequestI18N.requestText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const codesDataLoader = useCodesContext().codesDataLoader;

  const showAccessRequestErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      ...defaultErrorDialogProps,
      dialogTitle: AccessRequestI18N.requestTitle,
      dialogText: AccessRequestI18N.requestText,
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitAccessRequest = async (
    values:
      | IIDIRAccessRequestDataObject
      | IBCeIDBasicAccessRequestDataObject
      | IBCeIDBusinessAccessRequestDataObject
  ) => {
    try {
      const response = await nertApi.admin.createAdministrativeActivity({
        ...values,
        userGuid: authStateContext.nertUserWrapper.userGuid as string,
        name: authStateContext.nertUserWrapper.displayName as string,
        username: authStateContext.nertUserWrapper.userIdentifier as string,
        email: authStateContext.nertUserWrapper.email as string,
        identitySource: authStateContext.nertUserWrapper.identitySource as string,
        displayName: authStateContext.nertUserWrapper.displayName as string
      });

      if (!response?.id) {
        showAccessRequestErrorDialog({
          dialogError: 'The response from the server was null.'
        });
        return;
      }
      setIsSubmittingRequest(false);

      authStateContext.nertUserWrapper.refresh();

      history('/request-submitted');
    } catch (error) {
      const apiError = error as APIError;

      showAccessRequestErrorDialog({
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });

      setIsSubmittingRequest(false);
    }
  };

  let initialValues:
    | IIDIRAccessRequestDataObject
    | IBCeIDBasicAccessRequestDataObject
    | IBCeIDBusinessAccessRequestDataObject;

  let validationSchema:
    | typeof IDIRRequestFormYupSchema
    | typeof BCeIDBasicRequestFormYupSchema
    | typeof BCeIDBusinessRequestFormYupSchema;

  let requestForm: ReactElement;

  switch (authStateContext.nertUserWrapper.identitySource) {
    case SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS:
      initialValues = BCeIDBusinessRequestFormInitialValues;
      validationSchema = BCeIDBusinessRequestFormYupSchema;
      requestForm = <BCeIDRequestForm accountType={SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS} />;
      break;

    case SYSTEM_IDENTITY_SOURCE.BCEID_BASIC:
      initialValues = BCeIDBasicRequestFormInitialValues;
      validationSchema = BCeIDBasicRequestFormYupSchema;
      requestForm = <BCeIDRequestForm accountType={SYSTEM_IDENTITY_SOURCE.BCEID_BASIC} />;
      break;

    case SYSTEM_IDENTITY_SOURCE.IDIR:
    default:
      initialValues = IDIRRequestFormInitialValues;
      validationSchema = IDIRRequestFormYupSchema;
      requestForm = <IDIRRequestForm codes={codesDataLoader.data} />;
  }

  return (
    <Box p={4}>
      <Container maxWidth="md">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={(values) => {
            setIsSubmittingRequest(true);
            handleSubmitAccessRequest(values);
          }}>
          {({ handleSubmit }) => (
            <Box component={Paper} p={3}>
              <Typography variant="h1">Request Access</Typography>
              <Box mt={3}>
                <Typography variant="body1" color="textSecondary">
                  You will need to provide some additional details before accessing this
                  application.
                </Typography>
              </Box>
              <Box mt={4}>
                <form onSubmit={handleSubmit}>
                  {requestForm}
                  <Box mt={4} display="flex" justifyContent="flex-end">
                    <Box className="buttonWrapper" mr={1}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={pageStyles.actionButton}
                        disabled={isSubmittingRequest}>
                        <strong>Submit Request</strong>
                      </Button>
                      {isSubmittingRequest && (
                        <CircularProgress
                          className="buttonProgress"
                          variant="indeterminate"
                          size={20}
                          color="primary"
                        />
                      )}
                    </Box>
                    {/*
                      CircularProgress styling examples:
                      https://codesandbox.io/s/wonderful-cartwright-e18nc?file=/demo.tsx:895-1013
                      https://menubar.io/creating-a-material-ui-button-with-spinner-that-reflects-loading-state
                    */}
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        authStateContext.auth.signoutRedirect();
                      }}
                      sx={pageStyles.actionButton}
                      data-testid="logout-button">
                      Log out
                    </Button>
                  </Box>
                </form>
              </Box>
            </Box>
          )}
        </Formik>
      </Container>
    </Box>
  );
};

export default AccessRequestPage;
