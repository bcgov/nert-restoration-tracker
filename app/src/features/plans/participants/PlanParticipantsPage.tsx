import { mdiMenuDown, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import { CustomMenuButton } from 'components/toolbar/ActionToolbars';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useNertApi } from 'hooks/useNertApi';
import { CodeSet, IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import PlanParticipantsHeader from './PlanParticipantsHeader';
import { IGetProjectParticipantsResponseArrayItem } from 'interfaces/useProjectApi.interface';
import { useCodesContext } from 'hooks/useContext';

const pageStyles = {
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  teamMembersToolbar: {
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },
  teamMembersTable: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
};

const PlanParticipantsPage: React.FC = () => {
  const urlParams: Record<string, string | number | undefined> = useParams();
  const dialogContext = useContext(DialogContext);
  const restorationTrackerApi = useNertApi();

  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [planWithDetails, setPlanWithDetails] = useState<IGetPlanForViewResponse | null>(null);

  const [planParticipants, setPlanParticipants] = useState<
    IGetProjectParticipantsResponseArrayItem[] | null
  >(null);

  const planId = Number(urlParams['id']);

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false })
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

  const getPlan = useCallback(async () => {
    const planWithDetailsResponse = await restorationTrackerApi.plan.getPlanById(planId);

    if (!planWithDetailsResponse) {
      return;
    }

    setPlanWithDetails(planWithDetailsResponse);
  }, [restorationTrackerApi.project, urlParams]);

  useEffect(() => {
    if (isLoadingPlan && !planWithDetails) {
      getPlan();
      setIsLoadingPlan(false);
    }
  }, [isLoadingPlan, planWithDetails, getPlan]);

  const codes = useCodesContext().codesDataLoader;

  const getPlanParticipants = useCallback(async () => {
    try {
      const response = await restorationTrackerApi.project.getProjectParticipants(planId);

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.getParticipantsErrorTitle,
          dialogText: ProjectParticipantsI18N.getParticipantsErrorText
        });
        setPlanParticipants([]);
        return;
      }

      setPlanParticipants(response.participants);
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.getParticipantsErrorTitle,
        dialogText: ProjectParticipantsI18N.getParticipantsErrorText,
        dialogError: (error as APIError).message
      });
      setPlanParticipants([]);
      return;
    }
  }, [restorationTrackerApi.project, openErrorDialog, planId]);

  useEffect(() => {
    if (planParticipants) {
      return;
    }

    getPlanParticipants();
  }, [restorationTrackerApi, planId, planParticipants, getPlanParticipants]);

  const handleRemovePlanParticipant = async (projectParticipationId: number) => {
    try {
      const response = await restorationTrackerApi.project.removeProjectParticipant(
        planId,
        projectParticipationId
      );

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.removeParticipantErrorTitle,
          dialogText: ProjectParticipantsI18N.removeParticipantErrorText
        });
        return;
      }

      getPlanParticipants();
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.removeParticipantErrorTitle,
        dialogText: ProjectParticipantsI18N.removeParticipantErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  const TableRows: React.FC<{
    planParticipants: IGetProjectParticipantsResponseArrayItem[];
    codes: IGetAllCodeSetsResponse;
  }> = (tableRowsProps) => {
    if (tableRowsProps.planParticipants && tableRowsProps.planParticipants.length) {
      return (
        <>
          {tableRowsProps.planParticipants.map((row) => (
            <TableRow key={row.project_participation_id}>
              <TableCell scope="row">
                <strong>{row.user_identifier}</strong>
              </TableCell>
              <TableCell>
                <Box m={-1}>
                  <ChangeProjectRoleMenu
                    row={row}
                    projectRoleCodes={tableRowsProps.codes.project_roles}
                    refresh={getPlanParticipants}
                  />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box m={-1}>
                  <IconButton
                    title="Remove Team Member"
                    data-testid={'remove-project-participant-button'}
                    onClick={() =>
                      openYesNoDialog({
                        dialogTitle: ProjectParticipantsI18N.removeParticipantTitle,
                        dialogContent: (
                          <Typography variant="body1" component="div" color="textSecondary">
                            Removing user <strong>{row.user_identifier}</strong> will revoke their
                            access to this plan. Are you sure you want to proceed?
                          </Typography>
                        ),
                        yesButtonLabel: 'Remove User',
                        yesButtonProps: { color: 'secondary' },
                        noButtonLabel: 'Cancel',
                        onYes: () => {
                          handleRemovePlanParticipant(row.project_participation_id);
                          dialogContext.setYesNoDialog({ open: false });
                          dialogContext.setSnackbar({
                            open: true,
                            snackbarMessage: (
                              <Typography variant="body2" component="div">
                                User <strong>{row.user_identifier}</strong> removed from project.
                              </Typography>
                            )
                          });
                        }
                      })
                    }
                    size="large">
                    <Icon path={mdiTrashCanOutline} size={1} aria-label="remove team member" />
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
            No Team Members
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  if (!codes.isReady || !codes.data || !planParticipants || !planWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <PlanParticipantsHeader
        planWithDetails={planWithDetails}
        codes={codes.data}
        refresh={getPlanParticipants}
      />

      <Container maxWidth="xl">
        <Box my={3}>
          <Paper>
            <Toolbar sx={pageStyles.teamMembersToolbar}>
              <Typography variant="h2" color="inherit">
                Team Members
              </Typography>
            </Toolbar>

            <Table sx={pageStyles.teamMembersTable}>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Project Role</TableCell>
                  <TableCell width="100px" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRows planParticipants={planParticipants} codes={codes.data} />
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default PlanParticipantsPage;

export interface IChangeProjectRoleMenuProps {
  row: IGetProjectParticipantsResponseArrayItem;
  projectRoleCodes: CodeSet;
  refresh: () => void;
}

const ChangeProjectRoleMenu: React.FC<IChangeProjectRoleMenuProps> = (props) => {
  const { row, projectRoleCodes, refresh } = props;

  const dialogContext = useContext(DialogContext);
  const restorationTrackerApi = useNertApi();

  const defaultErrorDialogProps = {
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

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const handleChangeUserPermissionsClick = (
    item: IGetProjectParticipantsResponseArrayItem,
    newRole: string,
    newRoleId: number
  ) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Change Project Role?',
      dialogContent: (
        <Typography variant="body1" color="textSecondary">
          Change user <strong>{item.user_identifier}</strong>'s role to <strong>{newRole}</strong>?
        </Typography>
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
    item: IGetProjectParticipantsResponseArrayItem,
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
        showErrorDialog();
        return;
      }

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            User <strong>{item.user_identifier}</strong>'s role changed to{' '}
            <strong>{newRole}</strong>.
          </Typography>
        )
      });

      refresh();
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogError: apiError.message, dialogErrorDetails: apiError.errors });
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
      buttonEndIcon={<Icon path={mdiMenuDown} size={1} />}
    />
  );
};
