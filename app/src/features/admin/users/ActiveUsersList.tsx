import {
  mdiDotsVertical,
  mdiInformationOutline,
  mdiMenuDown,
  mdiPlus,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { CustomMenuButton, CustomMenuIconButton } from 'components/toolbar/ActionToolbars';
import { AddSystemUserI18N, DeleteSystemUserI18N, UpdateSystemUserI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useNertApi } from 'hooks/useNertApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import AddSystemUsersForm, {
  AddSystemUsersFormInitialValues,
  AddSystemUsersFormYupSchema,
  IAddSystemUsersForm
} from './AddSystemUsersForm';
import { ISystemUser } from 'interfaces/useUserApi.interface';

const pageStyles = {
  table: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
};

export interface IActiveUsersListProps {
  activeUsers: ISystemUser[];
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Table to display a list of active users.
 *
 * @param {*} props
 * @return {*}
 */
const ActiveUsersList: React.FC<IActiveUsersListProps> = (props) => {
  const restorationTrackerApi = useNertApi();
  const { activeUsers, codes } = props;
  const history = useNavigate();

  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(0);
  const dialogContext = useContext(DialogContext);

  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleRemoveUserClick = (row: ISystemUser) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Remove User?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Removing user <strong>{row.user_identifier}</strong> will revoke their access to this
          application and all related projects. Are you sure you want to proceed?
        </Typography>
      ),
      yesButtonLabel: 'Remove User',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'secondary' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        deActivateSystemUser(row);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deActivateSystemUser = async (user: ISystemUser) => {
    if (!user?.system_user_id) {
      return;
    }
    try {
      await restorationTrackerApi.user.deleteSystemUser(user.system_user_id);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong> removed from application.
            </Typography>
          </>
        ),
        open: true
      });

      props.refresh();
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: DeleteSystemUserI18N.deleteUserErrorTitle,
        dialogText: DeleteSystemUserI18N.deleteUserErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  const handleChangeUserPermissionsClick = (
    row: ISystemUser,
    newRoleName: string,
    newRoleId: number
  ) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Change User Role?',
      dialogContent: (
        <Typography variant="body1" color="textSecondary">
          Change user <strong>{row.user_identifier}</strong>'s role to{' '}
          <strong>{newRoleName}</strong>?
        </Typography>
      ),
      yesButtonLabel: 'Change Role',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'primary' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        changeSystemUserRole(row, newRoleId, newRoleName);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const changeSystemUserRole = async (user: ISystemUser, roleId: number, roleName: string) => {
    if (!user?.system_user_id) {
      return;
    }
    const roleIds = [roleId];

    try {
      await restorationTrackerApi.user.updateSystemUserRoles(user.system_user_id, roleIds);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong>'s role has changed to{' '}
              <strong>{roleName}</strong>.
            </Typography>
          </>
        ),
        open: true
      });

      props.refresh();
    } catch (error) {
      const apiError = error as APIError;
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: UpdateSystemUserI18N.updateUserErrorTitle,
        dialogText: UpdateSystemUserI18N.updateUserErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  const handleAddSystemUsersSave = async (values: IAddSystemUsersForm) => {
    setOpenAddUserDialog(false);

    try {
      for (const systemUser of values.systemUsers) {
        await restorationTrackerApi.admin.addSystemUser(
          systemUser.userIdentifier,
          systemUser.identitySource,
          systemUser.system_role
        );
      }

      props.refresh();

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            {values.systemUsers.length} system {values.systemUsers.length > 1 ? 'users' : 'user'}{' '}
            added.
          </Typography>
        )
      });
    } catch (error) {
      const apiError = error as APIError;
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: AddSystemUserI18N.addUserErrorTitle,
        dialogText: AddSystemUserI18N.addUserErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  return (
    <>
      <Paper>
        <Toolbar disableGutters>
          <Grid
            justifyContent="space-between" // Add it here :)
            container
            alignItems="center">
            <Grid item>
              <Box px={2}>
                <Typography variant="h2">Active Users ({activeUsers?.length || 0})</Typography>
              </Box>
            </Grid>

            <Grid item>
              <Box my={1} mx={2}>
                <Button
                  color="primary"
                  variant="outlined"
                  disableElevation
                  data-testid="invite-system-users-button"
                  aria-label={'Add Users'}
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={() => setOpenAddUserDialog(true)}>
                  <strong>Add Users</strong>
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
        <TableContainer>
          <Table sx={pageStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell width="100px" align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="active-users-table">
              {!activeUsers?.length && (
                <TableRow data-testid={'active-users-row-0'}>
                  <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                    No Active Users
                  </TableCell>
                </TableRow>
              )}
              {activeUsers.length > 0 &&
                activeUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow data-testid={`active-user-row-${index}`} key={row.system_user_id}>
                      <TableCell>
                        <strong>{row.user_identifier || 'Not Applicable'}</strong>
                      </TableCell>
                      <TableCell>
                        <Box m={-1}>
                          <CustomMenuButton
                            buttonLabel={row.role_names.join(', ') || 'Unassigned'}
                            buttonTitle={'Change User Permissions'}
                            buttonProps={{ variant: 'text' }}
                            menuItems={codes.system_roles
                              .sort((item1, item2) => {
                                return item1.name.localeCompare(item2.name);
                              })
                              .map((item) => {
                                return {
                                  menuLabel: item.name,
                                  menuOnClick: () =>
                                    handleChangeUserPermissionsClick(row, item.name, item.id)
                                };
                              })}
                            buttonEndIcon={<Icon path={mdiMenuDown} size={1} />}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box my={-1}>
                          <CustomMenuIconButton
                            buttonTitle="Actions"
                            buttonIcon={<Icon path={mdiDotsVertical} size={1} />}
                            menuItems={[
                              {
                                menuIcon: <Icon path={mdiInformationOutline} size={0.875} />,
                                menuLabel: 'View Users Details',
                                menuOnClick: () =>
                                  history(`/admin/users/${row.system_user_id}`, { state: row })
                              },
                              {
                                menuIcon: <Icon path={mdiTrashCanOutline} size={0.875} />,
                                menuLabel: 'Remove User',
                                menuOnClick: () => handleRemoveUserClick(row)
                              }
                            ]}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        {activeUsers?.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={activeUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event: unknown, newPage: number) =>
              handleChangePage(event, newPage, setPage)
            }
            onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChangeRowsPerPage(event, setPage, setRowsPerPage)
            }
          />
        )}
      </Paper>

      <EditDialog
        dialogTitle={'Add Users'}
        open={openAddUserDialog}
        dialogSaveButtonLabel={'Add'}
        component={{
          element: (
            <AddSystemUsersForm
              system_roles={
                props.codes?.system_roles?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: AddSystemUsersFormInitialValues,
          validationSchema: AddSystemUsersFormYupSchema
        }}
        onCancel={() => setOpenAddUserDialog(false)}
        onSave={(values) => {
          handleAddSystemUsersSave(values);
          setOpenAddUserDialog(false);
        }}
      />
    </>
  );
};

export default ActiveUsersList;
