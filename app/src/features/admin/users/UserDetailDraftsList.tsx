import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {
  Box,
  Card,
  Chip,
  FormControlLabel,
  IconButton,
  Link,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { DialogContext } from 'contexts/dialogContext';
import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import { getStateCodeFromLabel, getStatusStyle, states } from 'components/workflow/StateMachine';
import { ProjectTableI18N, PlanTableI18N, TableI18N } from 'constants/i18n';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as utils from 'utils/pagedProjectPlanTableUtils';
import useProjectPlanTableUtils from 'hooks/useProjectPlanTable';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import UserDetailDraftsTableHead from './UserDetailDraftsTableHead';
import UserDetailDraftsTableToolbar from './UserDetailDraftsTableToolbar';

interface IUserDetailDraftsListProps {
  drafts: IGetDraftsListResponse[];
}

const UserDetailDraftsList: React.FC<IUserDetailDraftsListProps> = (props) => {
  const { drafts } = props;

  const [page, setPage] = useState(0);
  const [projectDraftRows, setProjectDraftRows] = useState<utils.DraftData[]>([]);
  const [planDraftRows, setPlanDraftRows] = useState<utils.DraftData[]>([]);
  const { deleteDraft } = useProjectPlanTableUtils();

  const history = useNavigate();

  const draftCode = getStateCodeFromLabel(states.DRAFT);
  const draftStatusStyle = getStatusStyle(draftCode);

  function filterProjects(drafts: IGetDraftsListResponse[]): utils.DraftData[] {
    const rowsProjectDrafts = drafts
      ? drafts
          .filter((draft) => draft.is_project)
          .map((row, index) => {
            return {
              id: index,
              draftId: row.id,
              draftName: row.name,
              statusCode: draftCode,
              statusLabel: states.DRAFT,
              statusStyle: draftStatusStyle,
              deleteDraft: ''
            } as utils.DraftData;
          })
      : [];

    return rowsProjectDrafts;
  }

  function filterPlans(drafts: IGetDraftsListResponse[]): utils.DraftData[] {
    const rowsPlanDrafts = drafts
      ? drafts
          .filter((draft) => !draft.is_project)
          .map((row, index) => {
            return {
              id: index,
              draftId: row.id,
              draftName: row.name,
              statusCode: draftCode,
              statusLabel: states.DRAFT,
              statusStyle: draftStatusStyle,
              deleteDraft: ''
            } as utils.DraftData;
          })
      : [];

    return rowsPlanDrafts;
  }

  // Make sure state is preserved for table component
  useEffect(() => {
    const filteredProjects = filterProjects(drafts);
    setProjectDraftRows(filteredProjects);
    const filteredPlans = filterPlans(drafts);
    setPlanDraftRows(filteredPlans);
  }, [drafts]);

  function DraftProjectsTable() {
    const [order, setOrder] = useState<utils.Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof utils.DraftData>('draftName');
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (
      event: React.MouseEvent<unknown>,
      property: keyof utils.DraftData
    ) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
      setDense(event.target.checked);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - projectDraftRows.length) : 0;

    const visibleRows = useMemo(
      () =>
        utils
          .stableSort(projectDraftRows, utils.getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage]
    );

    const handleDeleteProjectDraft = (id: number) => {
      const delIndex = projectDraftRows.findIndex((row) => row.id === id);
      deleteDraft(true, projectDraftRows[delIndex].draftId);

      setProjectDraftRows((filterRows) => filterRows.filter((_, index) => index !== delIndex));

      if (0 < page && 1 === visibleRows.length) {
        setPage(page - 1);
      }
    };

    const defaultYesNoDialogProps: Partial<IYesNoDialogProps> = {
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    };
    const dialogContext = useContext(DialogContext);
    const openYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => {
      dialogContext.setYesNoDialog({
        ...defaultYesNoDialogProps,
        ...yesNoDialogProps,
        open: true
      });
    };

    return (
      <Box sx={{ width: '100%' }}>
        <UserDetailDraftsTableToolbar numRows={projectDraftRows.length} isProject={true} />
        <TableContainer>
          <Table
            sx={{ minWidth: 200 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}>
            <UserDetailDraftsTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={projectDraftRows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `projects-draft-table-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={row.id} sx={{ cursor: 'pointer' }}>
                    <TableCell component="th" id={labelId} scope="row" padding="normal">
                      <Link
                        data-testid={row.draftName}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={() => history(`/admin/projects/create?draftId=${row.draftId}`)}>
                        {row.draftName}
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      <Chip size="small" sx={draftStatusStyle} label={states.DRAFT} />
                    </TableCell>
                    <TableCell width="100px" align="left">
                      <Tooltip title={TableI18N.deleteDraft} placement="top">
                        <IconButton
                          onClick={() =>
                            openYesNoDialog({
                              dialogTitle:
                                TableI18N.deleteDraft + ' ' + ProjectTableI18N.projectConfirmation,
                              dialogTitleBgColor: '#E9FBFF',
                              dialogContent: (
                                <>
                                  <Typography
                                    sx={{ fontWeight: 600 }}
                                    variant="body1"
                                    color="textPrimary">
                                    {row.draftName}
                                  </Typography>
                                  <Typography variant="body1" color="textPrimary">
                                    Deleting this project draft will permanently remove it from the
                                    application. All the entered data will be lost.
                                  </Typography>
                                  <Typography mt={1} variant="body1" color="textPrimary">
                                    Are you sure you want to delete this draft?
                                  </Typography>
                                </>
                              ),
                              yesButtonLabel: TableI18N.deleteDraft,
                              yesButtonProps: { color: 'secondary' },
                              noButtonLabel: 'Cancel',
                              onYes: () => {
                                handleDeleteProjectDraft(row.id);
                                dialogContext.setYesNoDialog({ open: false });
                              }
                            })
                          }
                          color="error">
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows
                  }}>
                  <TableCell colSpan={9} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="space-between" sx={{ backgroundColor: '#E9FBFF' }}>
          <FormControlLabel
            sx={{ ml: '0.5rem' }}
            control={<Switch size="small" checked={dense} onChange={handleChangeDense} />}
            label={<Typography variant="caption">{TableI18N.densePadding}</Typography>}
          />
          <TablePagination
            sx={{ backgroundColor: '#E9FBFF' }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={projectDraftRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    );
  }

  function DraftPlansTable() {
    const [order, setOrder] = useState<utils.Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof utils.DraftData>('draftName');
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (
      event: React.MouseEvent<unknown>,
      property: keyof utils.DraftData
    ) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
      setDense(event.target.checked);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - planDraftRows.length) : 0;

    const visibleRows = useMemo(
      () =>
        utils
          .stableSort(planDraftRows, utils.getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage]
    );

    const handleDeletePlanDraft = (id: number) => {
      const delIndex = planDraftRows.findIndex((row) => row.id === id);
      deleteDraft(true, planDraftRows[delIndex].draftId);

      setPlanDraftRows((filterRows) => filterRows.filter((_, index) => index !== delIndex));

      if (0 < page && 1 === visibleRows.length) {
        setPage(page - 1);
      }
    };

    const defaultYesNoDialogProps: Partial<IYesNoDialogProps> = {
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    };
    const dialogContext = useContext(DialogContext);
    const openYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => {
      dialogContext.setYesNoDialog({
        ...defaultYesNoDialogProps,
        ...yesNoDialogProps,
        open: true
      });
    };

    return (
      <Box sx={{ width: '100%' }}>
        <UserDetailDraftsTableToolbar numRows={planDraftRows.length} isProject={false} />
        <TableContainer>
          <Table
            sx={{ minWidth: 200 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}>
            <UserDetailDraftsTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={planDraftRows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `plans-draft-table-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={row.id} sx={{ cursor: 'pointer' }}>
                    <TableCell component="th" id={labelId} scope="row" padding="normal">
                      <Link
                        data-testid={row.draftName}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={() => history(`/admin/projects/create?draftId=${row.draftId}`)}>
                        {row.draftName}
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      <Chip size="small" sx={draftStatusStyle} label={states.DRAFT} />
                    </TableCell>
                    <TableCell width="100px" align="left">
                      <Tooltip title={TableI18N.deleteDraft} placement="top">
                        <IconButton
                          onClick={() =>
                            openYesNoDialog({
                              dialogTitle:
                                TableI18N.deleteDraft + ' ' + PlanTableI18N.planConfirmation,
                              dialogTitleBgColor: '#FFF4EB',
                              dialogContent: (
                                <>
                                  <Typography
                                    sx={{ fontWeight: 600 }}
                                    variant="body1"
                                    color="textPrimary">
                                    {row.draftName}
                                  </Typography>
                                  <Typography variant="body1" color="textPrimary">
                                    Deleting this plan draft will permanently remove it from the
                                    application. All the entered data will be lost.
                                  </Typography>
                                  <Typography mt={1} variant="body1" color="textPrimary">
                                    Are you sure you want to delete this draft?
                                  </Typography>
                                </>
                              ),
                              yesButtonLabel: TableI18N.deleteDraft,
                              yesButtonProps: { color: 'secondary' },
                              noButtonLabel: 'Cancel',
                              onYes: () => {
                                handleDeletePlanDraft(row.id);
                                dialogContext.setYesNoDialog({ open: false });
                              }
                            })
                          }
                          color="error">
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows
                  }}>
                  <TableCell colSpan={9} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="space-between" sx={{ backgroundColor: '#FFF4EB' }}>
          <FormControlLabel
            sx={{ ml: '0.5rem' }}
            control={<Switch size="small" checked={dense} onChange={handleChangeDense} />}
            label={<Typography variant="caption">{TableI18N.densePadding}</Typography>}
          />
          <TablePagination
            sx={{ backgroundColor: '#FFF4EB' }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={planDraftRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    );
  }

  /**
   * Displays project and plan draft lists.
   */
  return (
    <>
      <Card>
        <DraftProjectsTable />
      </Card>
      <Card sx={{ marginTop: 3, marginBottom: 1 }}>
        <DraftPlansTable />
      </Card>
    </>
  );
};

export default UserDetailDraftsList;
