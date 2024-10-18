import { mdiExport } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import InfoDialog from 'components/dialog/InfoDialog';
import {
  getStateCodeFromLabel,
  getStateLabelFromCode,
  getStatusStyle,
  states
} from 'components/workflow/StateMachine';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectTableI18N, TableI18N } from 'constants/i18n';
import { IProjectsListProps } from 'interfaces/useProjectApi.interface';
import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as utils from 'utils/pagedProjectPlanTableUtils';
import { getFormattedDate } from 'utils/Utils';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import PublicInfoContent from 'pages/public/components/PublicInfoContent';
import { exportData, calculateSelectedProjectsPlans } from 'utils/dataTransfer';

const PublicProjectsListPage: React.FC<IProjectsListProps> = (props) => {
  const { projects } = props;
  const history = useNavigate();

  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);

  const [selected, setSelected] = useState<readonly number[]>([]);

  const rows = projects
    ?.filter(
      (proj) =>
        proj.project.is_project && proj.project.state_code != getStateCodeFromLabel(states.ARCHIVED)
    )
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
        archive: ''
      } as utils.ProjectData;
    });

  // Make sure the data download knows what projects are selected.
  useEffect(() => {
    const s = calculateSelectedProjectsPlans(selected, rows, projects);
    setSelectedProjects(s);
  }, [selected]);

  function ProjectsTableHead(props: utils.ProjectsTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler =
      (property: keyof utils.ProjectData) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
      };

    const [infoOpen, setInfoOpen] = useState(false);
    const [infoTitle, setInfoTitle] = useState('');

    const handleClickOpen = (headCell: utils.ProjectHeadCell) => {
      setInfoTitle(headCell.infoButton ? headCell.infoButton : '');
      setInfoOpen(true);
    };

    return (
      <>
        <InfoDialogDraggable
          isProject={true}
          open={infoOpen}
          dialogTitle={infoTitle}
          onClose={() => setInfoOpen(false)}>
          <PublicInfoContent isProject={true} contentIndex={infoTitle} />
        </InfoDialogDraggable>

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
                    <Tooltip
                      title={headCell.tooltipLabel ? headCell.tooltipLabel : null}
                      placement="top">
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={createSortHandler(headCell.id)}
                        sx={
                          orderBy === headCell.id
                            ? {
                                '& .MuiTableSortLabel-icon': {
                                  color: 'black !important'
                                }
                              }
                            : {}
                        }>
                        {headCell.label}
                        {orderBy === headCell.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {order === 'desc' ? TableI18N.sortedDesc : TableI18N.sortedAsc}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    </Tooltip>

                    {headCell.infoButton ? (
                      <IconButton onClick={() => handleClickOpen(headCell)}>
                        <InfoIcon color="info" />
                      </IconButton>
                    ) : null}
                  </TableCell>
                );
            })}
            <TableCell padding="checkbox">
              <Tooltip title={ProjectTableI18N.exportAllProjects} placement="top">
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
          </TableRow>
        </TableHead>
      </>
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
            {numSelected} {numSelected !== 1 ? 'projects' : 'project'} {TableI18N.selectedToExport}
          </Typography>
        ) : (
          <Typography
            sx={{ mx: '0.5rem', flex: '1 1 100%' }}
            variant="h2"
            id="tableTitle"
            component="div">
            {TableI18N.found} {rows?.length}{' '}
            {rows?.length !== 1 ? ProjectTableI18N.projects : ProjectTableI18N.project}
          </Typography>
        )}
        {numSelected > 0 ? (
          <Button
            sx={{ height: '2.8rem', width: '10rem', fontWeight: 600 }}
            color="primary"
            variant="outlined"
            onClick={() => exportData(selectedProjects)}
            disableElevation
            data-testid="export-project-button"
            aria-label={ProjectTableI18N.exportProjectsData}
            startIcon={<Icon path={mdiExport} size={1} />}>
            {TableI18N.exportData}
          </Button>
        ) : (
          <InfoDialog isProject={true} infoContent={'paged table'} />
        )}
      </Toolbar>
    );
  }

  function PublicProjectsTable() {
    const [order, setOrder] = useState<utils.Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof utils.ProjectData>('projectName');
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

    const focusTooltip = (focus: string) => {
      return (
        <Tooltip title={focus} disableHoverListener={focus.length < 35}>
          <Typography sx={utils.focusStyles.focusLabel} aria-label={`${focus}`}>
            {focus}
          </Typography>
        </Tooltip>
      );
    };

    const orgTooltip = (org: string) => {
      return (
        <Tooltip title={org} disableHoverListener={org.length < 35}>
          <Typography sx={utils.orgStyles.orgLabel} aria-label={`${org}`}>
            {org}
          </Typography>
        </Tooltip>
      );
    };

    return (
      <Box sx={{ width: '100%' }}>
        <ProjectsTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            data-testid={'project_table'}>
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
                    sx={{ cursor: 'pointer' }}
                    data-testid={`${row.projectName}-row`}>
                    <TableCell component="th" id={labelId} scope="row" padding="normal">
                      <Link
                        data-testid={`project-${row.projectName}-link`}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={() => {
                          history(`/projects/${row.projectId}`);
                        }}>
                        {row.projectName}
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      {row.focus &&
                        row.focus.split('\r').map((focus: string, key) => (
                          <Fragment key={key}>
                            <Box ml={-3}>
                              <Chip
                                data-testid="focus_item"
                                size="small"
                                sx={utils.focusStyles.focusProjectChip}
                                label={focusTooltip(focus)}
                              />
                            </Box>
                          </Fragment>
                        ))}

                      {!row.focus && (
                        <Chip
                          label="No Focuses"
                          sx={utils.focusStyles.noFocusChip}
                          data-testid="no_focuses_loaded"
                        />
                      )}
                    </TableCell>
                    <TableCell align="left">
                      {row.org &&
                        row.org.split('\r').map((organization: string, key) => (
                          <Fragment key={key}>
                            <Box>
                              <Chip
                                data-testid="organization_item"
                                size="small"
                                sx={utils.orgStyles.orgProjectChip}
                                label={orgTooltip(organization)}
                              />
                            </Box>
                          </Fragment>
                        ))}

                      {!row.org && (
                        <Chip
                          label="No Organizations"
                          sx={utils.orgStyles.noOrgChip}
                          data-testid="no_organizations_loaded"
                        />
                      )}
                    </TableCell>
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
                    <TableCell padding="checkbox">
                      <Tooltip
                        title={
                          isItemSelected ? TableI18N.exportSelected : TableI18N.exportNotSelected
                        }
                        placement="top">
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
      <PublicProjectsTable />
    </Card>
  );
};

export default PublicProjectsListPage;
