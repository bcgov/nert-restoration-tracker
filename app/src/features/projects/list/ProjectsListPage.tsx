import { mdiExport } from '@mdi/js';
import Icon from '@mdi/react';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import PagedTableInfoDialog from 'components/dialog/PagedTableInfoDialog';
import { SystemRoleGuard } from 'components/security/Guards';
import {
  getStateCodeFromLabel,
  getStateLabelFromCode,
  getStatusStyle,
  states
} from 'components/workflow/StateMachine';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { IProjectsListProps } from 'interfaces/useProjectPlanApi.interface';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from 'utils/authUtils';
import * as utils from 'utils/pagedProjectPlanTableUtils';
import { getFormattedDate } from 'utils/Utils';
import { TableI18N, ProjectTableI18N } from 'constants/i18n';

const ProjectsListPage: React.FC<IProjectsListProps> = (props) => {
  const { projects, drafts, myproject } = props;
  const history = useNavigate();
  const { keycloakWrapper } = useContext(AuthStateContext);
  const isUserCreator =
    isAuthenticated(keycloakWrapper) &&
    keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR])
      ? false
      : true;

  let rowsProjectFilterOutArchived = projects;
  if (rowsProjectFilterOutArchived && isUserCreator) {
    rowsProjectFilterOutArchived = projects.filter(
      (proj) => proj.project.state_code != getStateCodeFromLabel(states.ARCHIVED)
    );
  }

  const myProject = myproject && true === myproject ? true : false;
  const archCode = getStateCodeFromLabel(states.ARCHIVED);
  const rowsProject = rowsProjectFilterOutArchived
    ?.filter((proj) => proj.project.is_project)
    .map((row, index) => {
      return {
        id: index,
        projectId: row.project.project_id,
        projectName: row.project.project_name,
        authRef: row.permit.permits
          .map((item: { permit_number: any }) => item.permit_number)
          .join(', '),
        org: row.contact.contacts.map((item) => item.agency).join(', '),
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

  const draftCode = getStateCodeFromLabel(states.DRAFT);
  const draftStatusStyle = getStatusStyle(draftCode);
  const rowsDraft = drafts
    ? drafts
        .filter((draft) => draft.is_project)
        .map((row, index) => {
          return {
            id: index + rowsProject.length,
            projectId: row.id,
            projectName: row.name,
            authRef: '',
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

  const rows = rowsDraft.concat(rowsProject);

  function ProjectsTableHead(props: utils.ProjectsTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler =
      (property: keyof utils.ProjectData) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
      };

    return (
      <TableHead>
        <TableRow>
          {utils.projectHeadCells.map((headCell) => {
            if ('archive' !== headCell.id)
              return (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  sortDirection={orderBy === headCell.id ? order : false}>
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}>
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? TableI18N.sortedDesc : TableI18N.sortedAsc}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              );
          })}
          <SystemRoleGuard
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <TableCell>
              {!myProject ? (
                <Typography variant="inherit">{TableI18N.archive}</Typography>
              ) : (
                <>
                  <Typography variant="inherit">{TableI18N.archive}</Typography>
                  <Typography variant="inherit">{TableI18N.delete}</Typography>
                </>
              )}
            </TableCell>
          </SystemRoleGuard>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.PROJECT_CREATOR]}>
            <TableCell>
              {!myProject ? <></> : <Typography variant="inherit">{TableI18N.delete}</Typography>}
            </TableCell>
          </SystemRoleGuard>
          {!myProject ? (
            <TableCell padding="checkbox">
              <Tooltip title={ProjectTableI18N.exportAllProjects} placement="right">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={onSelectAllClick}
                  inputProps={{
                    'aria-label': ProjectTableI18N.selectAllProjectsForExport
                  }}
                />
              </Tooltip>
            </TableCell>
          ) : (
            <></>
          )}
        </TableRow>
      </TableHead>
    );
  }

  function ProjectsTableToolbar(props: utils.TableToolbarProps) {
    const { numSelected } = props;
    return (
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
          })
        }}>
        {numSelected > 0 ? (
          <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
            {numSelected} {numSelected !== 1 ? ProjectTableI18N.projects : ProjectTableI18N.project} {TableI18N.selectedToExport}
          </Typography>
        ) : (
          <Typography
            sx={{ mx: '0.5rem', flex: '1 1 100%' }}
            variant="h2"
            id="tableTitle"
            component="div">
            {TableI18N.found} {rows?.length} {rows?.length !== 1 ? ProjectTableI18N.projects : ProjectTableI18N.project}
          </Typography>
        )}
        {numSelected > 0 ? (
          <Button
            sx={{ height: '3rem', width: '11rem' }}
            color="primary"
            variant="outlined"
            disableElevation
            data-testid="export-project-button"
            aria-label={ProjectTableI18N.exportProjectsData}
            startIcon={<Icon path={mdiExport} size={1} />}>
            <strong>{TableI18N.exportData}</strong>
          </Button>
        ) : (
          <PagedTableInfoDialog isProject={true} />
        )}
      </Toolbar>
    );
  }

  function ProjectsTable() {
    const [order, setOrder] = useState<utils.Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof utils.ProjectData>('projectName');
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

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

    const visibleRows = React.useMemo(
      () =>
        utils
          .stableSort(rows, utils.getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage]
    );

    return (
      <Box sx={{ width: '100%' }}>
        <ProjectsTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}>
            <ProjectsTableHead
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
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}>
                    <TableCell component="th" id={labelId} scope="row" padding="normal">
                      <Link
                        data-testid={row.projectName}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={
                          draftCode != row.statusCode
                            ? () => history(`/admin/projects/${row.projectId}`)
                            : () => history(`/admin/projects/create?draftId=${row.projectId}`)
                        }>
                        {row.projectName}
                      </Link>
                    </TableCell>
                    <TableCell align="left">{row.authRef}</TableCell>
                    <TableCell align="left">{row.org}</TableCell>
                    <TableCell align="left">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.plannedStartDate)}
                    </TableCell>
                    <TableCell align="left">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.actualStartDate)}
                    </TableCell>
                    <TableCell align="left">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.plannedEndDate)}
                    </TableCell>
                    <TableCell align="left">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.actualEndDate)}
                    </TableCell>
                    <TableCell align="left">
                      <Chip
                        size="small"
                        sx={getStatusStyle(row.statusCode)}
                        label={row.statusLabel}
                      />
                    </TableCell>
                    <TableCell align="left">
                      {draftCode !== row.statusCode ? (
                        <SystemRoleGuard
                          validSystemRoles={[
                            SYSTEM_ROLE.SYSTEM_ADMIN,
                            SYSTEM_ROLE.DATA_ADMINISTRATOR
                          ]}>
                          <Tooltip
                            title={archCode !== row.statusCode ? TableI18N.archive : TableI18N.unarchive}
                            placement="right">
                            <IconButton color={archCode !== row.statusCode ? 'info' : 'warning'}>
                              {archCode !== row.statusCode ? <ArchiveIcon /> : <UnarchiveIcon />}
                            </IconButton>
                          </Tooltip>
                        </SystemRoleGuard>
                      ) : (
                        <Tooltip title={TableI18N.deleteDraft} placement="right">
                          <IconButton color="error">
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>

                    {!myProject ? (
                      <TableCell padding="checkbox">
                        <Tooltip
                          title={isItemSelected ? TableI18N.exportSelected : TableI18N.exportNotSelected}
                          placement="right">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId
                            }}
                            onClick={(event) => handleClick(event, row.id)}
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
            count={rows.length}
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
   * Displays project list.
   */
  return (
    <Card>
      <ProjectsTable />
    </Card>
  );
};

export default ProjectsListPage;
