import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNertApi } from 'hooks/useNertApi';
import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { SystemUserI18N } from '../../../constants/i18n';
import { DialogContext } from '../../../contexts/dialogContext';
import { APIError } from '../../../hooks/api/useAxios';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';

const pageStyles = {
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  spacingRight: {
    paddingRight: '1rem'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  projectTitle: {
    fontWeight: 400
  },
  roleChip: {
    backgroundColor: '#4371C5',
    color: '#ffffff'
  }
};

export interface IUsersHeaderProps {
  userDetails: IGetUserResponse;
}

const UsersDetailHeader: React.FC<IUsersHeaderProps> = (props) => {
  const { userDetails } = props;
  const history = useNavigate();
  const restorationTrackerApi = useNertApi();
  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false })
  };

  const defaultYesNoDialogProps: Partial<IYesNoDialogProps> = {
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false })
  };

  const openYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      ...yesNoDialogProps,
      open: true
    });
  };

  const openErrorDialog = useCallback(
    (errorDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({
        ...defaultErrorDialogProps,
        ...errorDialogProps,
        open: true
      });
    },
    [defaultErrorDialogProps, dialogContext]
  );

  const deActivateSystemUser = async (user: IGetUserResponse) => {
    if (!user?.id) {
      return;
    }
    try {
      await restorationTrackerApi.user.deleteSystemUser(user.id);

      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong> removed from application.
            </Typography>
          </>
        ),
        open: true
      });

      history('/admin/users');
    } catch (error) {
      openErrorDialog({
        dialogTitle: SystemUserI18N.removeUserErrorTitle,
        dialogText: SystemUserI18N.removeUserErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  return (
    <>
      <Box pb={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component="button"
            color="primary"
            onClick={() => history('/admin/users')}
            aria-current="page"
            sx={pageStyles.breadCrumbLink}>
            <Typography variant="body2">Manage Users</Typography>
          </Link>
          <Typography variant="body2">{userDetails.user_identifier}</Typography>
        </Breadcrumbs>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Box display="flex">
            <Typography data-testid="user-detail-title" sx={pageStyles.spacingRight} variant="h1">
              User - <span style={pageStyles.projectTitle}>{userDetails.user_identifier}</span>
            </Typography>
          </Box>

          <Box my={1.5}>
            <Chip
              data-testid="user-role-chip"
              sx={pageStyles.roleChip}
              size="small"
              label={userDetails.role_names[0] || 'Unassigned'}></Chip>
          </Box>
        </Box>
        <Box ml={2}>
          <Tooltip arrow color="secondary" title={'delete'}>
            <>
              <Button
                title="Remove User"
                color="primary"
                variant="outlined"
                sx={pageStyles.actionButton}
                startIcon={<Icon path={mdiTrashCanOutline} size={0.875} />}
                data-testid={'remove-user-button'}
                onClick={() =>
                  openYesNoDialog({
                    dialogTitle: SystemUserI18N.removeSystemUserTitle,
                    dialogContent: (
                      <>
                        <Typography variant="body1" color="textPrimary">
                          Removing user <strong>{userDetails.user_identifier}</strong> will revoke
                          their access to all projects.
                        </Typography>
                        <Typography variant="body1" color="textPrimary">
                          Are you sure you want to proceed?
                        </Typography>
                      </>
                    ),
                    yesButtonLabel: 'Remove User',
                    yesButtonProps: { color: 'secondary' },
                    noButtonLabel: 'Cancel',
                    onYes: () => {
                      deActivateSystemUser(userDetails);
                      dialogContext.setYesNoDialog({ open: false });
                    }
                  })
                }>
                Remove User
              </Button>
            </>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};

export default UsersDetailHeader;
