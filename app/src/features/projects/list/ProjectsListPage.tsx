import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import {
  Box,
  Card,
  Checkbox,
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
import { SystemRoleGuard } from 'components/security/Guards';
import {
  getStateCodeFromLabel,
  getStateLabelFromCode,
  getStatusStyle,
  states
} from 'components/workflow/StateMachine';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectTableI18N, TableI18N } from 'constants/i18n';
import { SYSTEM_ROLE } from 'constants/roles';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { IGetProjectForViewResponse, IProjectsListProps } from 'interfaces/useProjectApi.interface';
import React, { Fragment, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as utils from 'utils/pagedProjectPlanTableUtils';
import { getFormattedDate } from 'utils/Utils';
import { calculateSelectedProjectsPlans } from 'utils/dataTransfer';
import ProjectsTableHead from 'features/projects/components/ProjectsTableHead';
import useProjectPlanTableUtils from 'hooks/useProjectPlanTable';
import ProjectsTableToolbar from 'features/projects/components/ProjectsTableToolbar';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';

const ProjectsListPage: React.FC<IProjectsListProps> = (props) => {
  const { projects, drafts, myproject } = props;
  const history = useNavigate();

  const [selected, setSelected] = useState<readonly number[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<utils.ProjectData[]>([]);
  const [page, setPage] = useState(0);
  // using state for table row changes
  const [rows, setRows] = useState<utils.ProjectData[]>([]);

  const authStateContext = useAuthStateContext();

  const isUserAdmin =
    authStateContext.nertUserWrapper.roleNames &&
    (authStateContext.nertUserWrapper.roleNames.includes(SYSTEM_ROLE.SYSTEM_ADMIN) ||
      authStateContext.nertUserWrapper.roleNames.includes(SYSTEM_ROLE.MAINTAINER))
      ? true
      : false;

  const myProject = myproject && true === myproject ? true : false;
  const archCode = getStateCodeFromLabel(states.ARCHIVED);
  const draftCode = getStateCodeFromLabel(states.DRAFT);
  const draftStatusStyle = getStatusStyle(draftCode);

  function filterProjects(
    projects: IGetProjectForViewResponse[],
    drafts?: IGetDraftsListResponse[]
  ): utils.ProjectData[] {
    let rowsProjectFilterOutArchived = projects;
    if (rowsProjectFilterOutArchived && !isUserAdmin) {
      rowsProjectFilterOutArchived = projects.filter(
        (proj) => proj.project.state_code != getStateCodeFromLabel(states.ARCHIVED)
      );
    }

    const rowsProject = rowsProjectFilterOutArchived
      ?.filter((proj) => proj.project.is_project)
      .map((row, index) => {
        return {
          id: index,
          projectId: row.project.project_id,
          projectName: row.project.project_name,
          focus: utils.resolveProjectPlanFocus(
            row.project.is_healing_land,
            row.project.is_healing_people,
            row.project.is_land_initiative,
            row.project.is_cultural_initiative
          ),
          org: row.contact.contacts.map((item) => item.organization).join('\r'),
          plannedStartDate: row.project.start_date,
          plannedEndDate: row.project.end_date,
          actualStartDate: row.project.actual_start_date,
          actualEndDate: row.project.actual_end_date,
          statusCode: row.project.state_code,
          statusLabel: getStateLabelFromCode(row.project.state_code),
          statusStyle: getStatusStyle(row.project.state_code),
          archive: row.project.state_code !== archCode ? TableI18N.archive : TableI18N.unarchive
        } as utils.ProjectData;
      });

    const rowsDraft = drafts
      ? drafts
          .filter((draft) => draft.is_project)
          .map((row, index) => {
            return {
              id: index + rowsProject.length,
              projectId: row.id,
              projectName: row.name,
              focus: '',
              org: '',
              plannedStartDate: '',
              plannedEndDate: '',
              actualStartDate: '',
              actualEndDate: '',
              statusCode: draftCode,
              statusLabel: states.DRAFT,
              statusStyle: draftStatusStyle,
              archive: ''
            } as utils.ProjectData;
          })
      : [];

    return rowsDraft.concat(rowsProject);
  }

  // Make sure state is preserved for table component
  useEffect(() => {
    const filteredProjects = filterProjects(projects, drafts);
    setRows(filteredProjects);
  }, [projects, drafts]);

  // Make sure the data download knows what projects are selected.
  useEffect(() => {
    const s = calculateSelectedProjectsPlans(selected, rows, projects);
    setSelectedProjects(s);
  }, [selected]);

  function ProjectsTable() {
    const [order, setOrder] = useState<utils.Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof utils.ProjectData>('projectName');
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const { changeStateCode, deleteDraft, deleteProjectOrPlan } = useProjectPlanTableUtils();

    const handleRequestSort = (
      event: React.MouseEvent<unknown>,
      property: keyof utils.ProjectData
    ) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        const newSelected = rows.map((n) => n.id);
        setSelected(newSelected);
        return;
      }
      setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: readonly number[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }
      setSelected(newSelected);
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

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = useMemo(
      () =>
        utils
          .stableSort(rows, utils.getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage]
    );

    const focusTooltip = (focus: string) => {
      return (
        <Tooltip title={focus} disableHoverListener={focus.length < 35}>
          <Typography
            sx={utils.focusStyles.focusLabel}
            aria-label={`Focus: ${focus}`}
            role="tooltip">
            {focus}
          </Typography>
        </Tooltip>
      );
    };

    const orgTooltip = (org: string) => {
      return (
        <Tooltip title={org} disableHoverListener={org.length < 35}>
          <Typography
            sx={utils.orgStyles.orgLabel}
            aria-label={`Organization: ${org}`}
            role="tooltip">
            {org}
          </Typography>
        </Tooltip>
      );
    };

    const handleArchiveUnarchive = (id: number) => {
      const updIndex = rows.findIndex((row) => row.id === id);
      const stateArchiveCode = getStateCodeFromLabel(states.ARCHIVED);

      if (rows[updIndex].statusCode !== stateArchiveCode) {
        changeStateCode(true, rows[updIndex].projectId, stateArchiveCode);

        rows[updIndex].statusCode = stateArchiveCode;
        rows[updIndex].statusLabel = states.ARCHIVED;
        rows[updIndex].archive = TableI18N.unarchive;
        setRows([...rows]);
        setPage(page);
        return;
      }

      const statePlanningCode = getStateCodeFromLabel(states.PLANNING);

      changeStateCode(true, rows[updIndex].projectId, statePlanningCode);

      rows[updIndex].statusCode = statePlanningCode;
      rows[updIndex].statusLabel = states.PLANNING;
      rows[updIndex].archive = TableI18N.archive;
      setRows([...rows]);
      setPage(page);
    };

    const handleDeleteDraft = (id: number) => {
      const delIndex = rows.findIndex((row) => row.id === id);
      deleteDraft(true, rows[delIndex].projectId);

      setRows((filterRows) => filterRows.filter((_, index) => index !== delIndex));

      if (0 < page && 1 === visibleRows.length) {
        setPage(page - 1);
      }
    };

    const handleDeleteProject = (id: number) => {
      const delIndex = rows.findIndex((row) => row.id === id);
      deleteProjectOrPlan(true, rows[delIndex].projectId);

      setRows((filterRows) => filterRows.filter((_, index) => index !== delIndex));

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
        <ProjectsTableToolbar
          numSelected={selected.length}
          numRows={rows.length}
          selectedProjects={selectedProjects}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            data-testid={'project_table'}
            role="table">
            <ProjectsTableHead
              myProject={myProject}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `projects-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="row"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}>
                    <TableCell component="th" id={labelId} scope="row" padding="normal" role="cell">
                      <Link
                        data-testid={`project-${row.projectName}-link`}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={
                          draftCode != row.statusCode
                            ? () => history(`/admin/projects/${row.projectId}/details`)
                            : () => history(`/admin/projects/create?draftId=${row.projectId}`)
                        }
                        aria-label={`View details for project ${row.projectName}`}>
                        {row.projectName}
                      </Link>
                    </TableCell>
                    <TableCell align="left" role="cell">
                      {row.focus &&
                        row.focus.split('\r').map((focus: string, key) => (
                          <Fragment key={key}>
                            <Box ml={-3}>
                              <Chip
                                data-testid="focus_item"
                                size="small"
                                sx={utils.focusStyles.focusProjectChip}
                                label={focusTooltip(focus)}
                                role="button"
                                aria-label={`Focus: ${focus}`}
                              />
                            </Box>
                          </Fragment>
                        ))}

                      {!row.focus && (
                        <Chip
                          label="No Focuses"
                          sx={utils.focusStyles.noFocusChip}
                          data-testid="no_focuses_loaded"
                          role="button"
                          aria-label="No focuses available"
                        />
                      )}
                    </TableCell>
                    <TableCell align="left" role="cell">
                      {row.org &&
                        row.org.split('\r').map((organization: string, key) => (
                          <Fragment key={key}>
                            <Box>
                              <Chip
                                data-testid="organization_item"
                                size="small"
                                sx={utils.orgStyles.orgProjectChip}
                                label={orgTooltip(organization)}
                                role="button"
                                aria-label={`Organization: ${organization}`}
                              />
                            </Box>
                          </Fragment>
                        ))}

                      {!row.org && (
                        <Chip
                          label="No Organizations"
                          sx={utils.orgStyles.noOrgChip}
                          data-testid="no_organizations_loaded"
                          role="button"
                          aria-label="No organizations available"
                        />
                      )}
                    </TableCell>
                    <TableCell align="left" role="cell">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.plannedStartDate)}
                    </TableCell>
                    <TableCell align="left" role="cell">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.actualStartDate)}
                    </TableCell>
                    <TableCell align="left" role="cell">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.plannedEndDate)}
                    </TableCell>
                    <TableCell align="left" role="cell">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.actualEndDate)}
                    </TableCell>
                    <TableCell sx={{ p: 0 }} align="left" role="cell">
                      <Chip
                        size="small"
                        sx={getStatusStyle(row.statusCode)}
                        label={row.statusLabel}
                        role="button"
                        aria-label={`Status: ${row.statusLabel}`}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 50 }} align="left" role="cell">
                      {draftCode !== row.statusCode ? (
                        <SystemRoleGuard
                          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}>
                          <Tooltip
                            title={
                              archCode !== row.statusCode ? TableI18N.archive : TableI18N.unarchive
                            }
                            placement="top">
                            <IconButton
                              sx={{ py: 0 }}
                              onClick={() =>
                                openYesNoDialog({
                                  dialogTitle:
                                    (archCode !== row.statusCode
                                      ? TableI18N.archive
                                      : TableI18N.unarchive) +
                                    ' ' +
                                    ProjectTableI18N.projectConfirmation,
                                  dialogTitleBgColor: '#E9FBFF',
                                  dialogContent: (
                                    <>
                                      <Typography
                                        sx={{ fontWeight: 600 }}
                                        variant="body1"
                                        color="textPrimary">
                                        {row.projectName}
                                      </Typography>
                                      {archCode !== row.statusCode && (
                                        <>
                                          <Typography variant="body1" color="textPrimary">
                                            Archiving this project will not remove it from the
                                            application, only means it will not be publicly
                                            available any more.
                                          </Typography>
                                          <Typography mt={1} variant="body1" color="textPrimary">
                                            Are you sure you want to archive this project?
                                          </Typography>
                                        </>
                                      )}
                                      {archCode === row.statusCode && (
                                        <>
                                          <Typography variant="body1" color="textPrimary">
                                            Unarchiving this project will make it public again. The
                                            new status for the project will be "PLANNING". Please
                                            make sure there is no PI information before publishing.
                                          </Typography>
                                          <Typography mt={1} variant="body1" color="textPrimary">
                                            Are you sure you want to unarchive (publish) this
                                            project?'
                                          </Typography>
                                        </>
                                      )}
                                    </>
                                  ),
                                  yesButtonLabel:
                                    archCode !== row.statusCode
                                      ? 'Archive Project'
                                      : 'Unarchive Project',
                                  yesButtonProps: { color: 'secondary' },
                                  noButtonLabel: 'Cancel',
                                  onYes: () => {
                                    handleArchiveUnarchive(row.id);
                                    dialogContext.setYesNoDialog({ open: false });
                                  }
                                })
                              }
                              color={archCode !== row.statusCode ? 'info' : 'warning'}
                              aria-label={
                                archCode !== row.statusCode
                                  ? 'Archive project'
                                  : 'Unarchive project'
                              }>
                              {archCode !== row.statusCode ? <ArchiveIcon /> : <UnarchiveIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={TableI18N.delete} placement="bottom">
                            <IconButton
                              sx={{ py: 0 }}
                              onClick={() =>
                                openYesNoDialog({
                                  dialogTitle:
                                    TableI18N.delete + ' ' + ProjectTableI18N.projectConfirmation,
                                  dialogTitleBgColor: '#E9FBFF',
                                  dialogContent: (
                                    <>
                                      <Typography
                                        sx={{ fontWeight: 600 }}
                                        variant="body1"
                                        color="textPrimary">
                                        {row.projectName}
                                      </Typography>
                                      <Typography variant="body1" color="textPrimary">
                                        {ProjectTableI18N.deleteText}
                                      </Typography>
                                      <Typography mt={1} variant="body1" color="textPrimary">
                                        {ProjectTableI18N.deleteWarning}
                                      </Typography>
                                    </>
                                  ),
                                  yesButtonLabel: ProjectTableI18N.deleteProject,
                                  yesButtonProps: { color: 'secondary' },
                                  noButtonLabel: 'Cancel',
                                  onYes: () => {
                                    handleDeleteProject(row.id);
                                    dialogContext.setYesNoDialog({ open: false });
                                  }
                                })
                              }
                              color="error"
                              aria-label="Delete project">
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        </SystemRoleGuard>
                      ) : (
                        <Tooltip title={TableI18N.deleteDraft} placement="top">
                          <IconButton
                            onClick={() =>
                              openYesNoDialog({
                                dialogTitle:
                                  TableI18N.deleteDraft +
                                  ' ' +
                                  ProjectTableI18N.projectConfirmation,
                                dialogTitleBgColor: '#E9FBFF',
                                dialogContent: (
                                  <>
                                    <Typography
                                      sx={{ fontWeight: 600 }}
                                      variant="body1"
                                      color="textPrimary">
                                      {row.projectName}
                                    </Typography>
                                    <Typography variant="body1" color="textPrimary">
                                      Deleting this project draft will permanently remove it from
                                      the application. All the entered data will be lost.
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
                                  handleDeleteDraft(row.id);
                                  dialogContext.setYesNoDialog({ open: false });
                                }
                              })
                            }
                            color="error"
                            aria-label="Delete draft">
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>

                    {!myProject ? (
                      <TableCell padding="checkbox" role="cell">
                        <Tooltip
                          title={
                            isItemSelected ? TableI18N.exportSelected : TableI18N.exportNotSelected
                          }
                          placement="right">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId
                            }}
                            onClick={(event) => handleClick(event, row.id)}
                            aria-label={isItemSelected ? 'Deselect project' : 'Select project'}
                          />
                        </Tooltip>
                      </TableCell>
                    ) : (
                      <></>
                    )}
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows
                  }}
                  role="row">
                  <TableCell colSpan={9} role="cell" />
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
            aria-label="Toggle dense padding"
          />
          <TablePagination
            sx={{ backgroundColor: '#E9FBFF' }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            aria-label="Table pagination"
          />
        </Box>
      </Box>
    );
  }

  /**
   * Displays project list.
   */
  return (
    <Card role="region" aria-labelledby="projects-table-header">
      <ProjectsTable />
    </Card>
  );
};

export default ProjectsListPage;
