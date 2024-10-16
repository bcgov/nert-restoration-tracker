import { mdiMenuDown, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useNertApi } from 'hooks/useNertApi';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { CustomMenuButton } from '../../../components/toolbar/ActionToolbars';
import { ProjectParticipantsI18N, SystemUserI18N } from '../../../constants/i18n';
import { DialogContext } from '../../../contexts/dialogContext';
import { APIError } from '../../../hooks/api/useAxios';
import { CodeSet, IGetAllCodeSetsResponse } from '../../../interfaces/useCodesApi.interface';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectApi.interface';
import { ISystemUser } from '../../../interfaces/useUserApi.interface';
import { useCodesContext } from 'hooks/useContext';

const pageStyles = {
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  projectMembersToolbar: {
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },
  projectMembersTable: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
};

export interface IProjectDetailsProps {
  userDetails: ISystemUser;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const UsersDetailProjectsPlans: React.FC<IProjectDetailsProps> = (props) => {
  const { userDetails } = props;
  const restorationTrackerApi = useNertApi();
  const dialogContext = useContext(DialogContext);
  const history = useNavigate();

  const [assignedProjects, setAssignedProjects] = useState<IGetUserProjectsListResponse[]>();

  const handleGetUserProjects = useCallback(
    async (userId: number) => {
      const userProjectsListResponse =
        await restorationTrackerApi.project.getAllUserProjectsParticipation(userId);
      setAssignedProjects(userProjectsListResponse);
    },
    [restorationTrackerApi.project]
  );

  const refresh = () => handleGetUserProjects(userDetails.id);

  useEffect(() => {
    if (assignedProjects) {
      return;
    }

    handleGetUserProjects(userDetails.id);
  }, [userDetails.id, assignedProjects, handleGetUserProjects]);

  const codes = useCodesContext().codesDataLoader;

  const handleRemoveProjectParticipant = async (
    projectId: number,
    projectParticipationId: number
  ) => {
    try {
      const response = await restorationTrackerApi.project.removeProjectParticipant(
        projectId,
        projectParticipationId
      );

      if (!response) {
        openErrorDialog({
          dialogTitle: SystemUserI18N.removeUserErrorTitle,
          dialogText: SystemUserI18N.removeUserErrorText
        });
        return;
      }

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            User <strong>{userDetails.user_identifier}</strong> removed from project.
          </Typography>
        )
      });

      handleGetUserProjects(userDetails.id);
    } catch (error) {
      openErrorDialog({
        dialogTitle: SystemUserI18N.removeUserErrorTitle,
        dialogText: SystemUserI18N.removeUserErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

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

  const TableRows: React.FC<{
    assignedProjects: IGetUserProjectsListResponse[];
    codes: IGetAllCodeSetsResponse;
  }> = (tableRowsProps) => {
    if (tableRowsProps.assignedProjects && tableRowsProps.assignedProjects.length) {
      return (
        <>
          {tableRowsProps.assignedProjects.map((row) => (
            <TableRow key={row.project_id}>
              <TableCell scope="row">
                <Link
                  color="primary"
                  onClick={() => history(`/admin/projects/${row.project_id}/details`)}
                  aria-current="page">
                  <Typography variant="body2">{row.name}</Typography>
                </Link>
              </TableCell>

              <TableCell>
                <Box m={-1}>
                  <ChangeProjectRoleMenu
                    row={row}
                    user_identifier={userDetails.user_identifier}
                    projectRoleCodes={tableRowsProps.codes.project_roles}
                    refresh={refresh}
                  />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box m={-1}>
                  <IconButton
                    title="Remove Participant"
                    data-testid={'remove-project-participant-button'}
                    aria-label="Remove Participant"
                    onClick={() =>
                      openYesNoDialog({
                        dialogTitle: SystemUserI18N.removeUserFromProject,
                        dialogContent: (
                          <>
                            <Typography variant="body1" color="textSecondary">
                              Removing user <strong>{userDetails.user_identifier}</strong> will
                              revoke their access to this project.
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
                          handleRemoveProjectParticipant(
                            row.project_id,
                            row.project_participation_id
                          );
                          dialogContext.setYesNoDialog({ open: false });
                        }
                      })
                    }
                    size="large">
                    <Icon path={mdiTrashCanOutline} size={1} aria-label="Trash Can Icon" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </>
      );
    }

    return (
      <TableRow>
        <TableCell colSpan={3}>
          <Box display="flex" justifyContent="center">
            No Projects or Plans
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  if (!codes.isReady || !codes.data || !assignedProjects) {
    return (
      <CircularProgress
        data-testid="project-loading"
        className="pageProgress"
        size={40}
        aria-label="Loading"
      />
    );
  }

  return (
    <Paper>
      <Toolbar sx={pageStyles.projectMembersToolbar}>
        <Typography data-testid="projects_header" variant="h2" id="projects-header">
          Assigned Projects and Plans ({assignedProjects?.length})
        </Typography>
      </Toolbar>
      <Box>
        <Table sx={pageStyles.projectMembersTable} aria-labelledby="projects-header">
          <TableHead>
            <TableRow>
              <TableCell>Project/Plan Name</TableCell>
              <TableCell>User Role</TableCell>
              <TableCell width="100px" align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="resources-table">
            <TableRows assignedProjects={assignedProjects} codes={codes.data} />
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default UsersDetailProjectsPlans;

export interface IChangeProjectRoleMenuProps {
  row: IGetUserProjectsListResponse;
  user_identifier: string;
  projectRoleCodes: CodeSet;
  refresh: () => void;
}

const ChangeProjectRoleMenu: React.FC<IChangeProjectRoleMenuProps> = (props) => {
  const { row, user_identifier, projectRoleCodes, refresh } = props;

  const dialogContext = useContext(DialogContext);
  const restorationTrackerApi = useNertApi();

  const errorDialogProps = {
    dialogTitle: ProjectParticipantsI18N.updateParticipantRoleErrorTitle,
    dialogText: ProjectParticipantsI18N.updateParticipantRoleErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const displayErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const handleChangeUserPermissionsClick = (
    item: IGetUserProjectsListResponse,
    newRole: string,
    newRoleId: number
  ) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Change Role?',
      dialogContent: (
        <>
          <Typography color="textPrimary">
            Change user <strong>{user_identifier}</strong>'s role to <strong>{newRole}</strong>?
          </Typography>
        </>
      ),
      yesButtonLabel: 'Change Role',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'primary' },
      open: true,
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onYes: () => {
        changeProjectParticipantRole(item, newRole, newRoleId);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const changeProjectParticipantRole = async (
    item: IGetUserProjectsListResponse,
    newRole: string,
    newRoleId: number
  ) => {
    if (!item?.project_participation_id) {
      return;
    }

    try {
      const status = await restorationTrackerApi.project.updateProjectParticipantRole(
        item.project_id,
        item.project_participation_id,
        newRoleId
      );

      if (!status) {
        displayErrorDialog();
        return;
      }

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            User <strong>{user_identifier}</strong>'s role changed to <strong>{newRole}</strong>.
          </Typography>
        )
      });

      refresh();
    } catch (error) {
      displayErrorDialog({
        dialogTitle: SystemUserI18N.updateProjectLeadRoleErrorTitle,
        dialogText: SystemUserI18N.updateProjectLeadRoleErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  const currentProjectRoleName = projectRoleCodes.find(
    (item) => item.id === row.project_role_id
  )?.name;

  return (
    <CustomMenuButton
      buttonLabel={currentProjectRoleName}
      buttonTitle={'Change Project Role'}
      buttonProps={{ variant: 'text' }}
      menuItems={projectRoleCodes.map((roleCode) => {
        return {
          menuLabel: roleCode.name,
          menuOnClick: () => handleChangeUserPermissionsClick(row, roleCode.name, roleCode.id)
        };
      })}
      buttonEndIcon={<Icon path={mdiMenuDown} size={1} aria-label="Menu Down Icon" />}
    />
  );
};
