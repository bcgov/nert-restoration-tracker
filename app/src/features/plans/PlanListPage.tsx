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
import InfoDialog from 'components/dialog/InfoDialog';
import { SystemRoleGuard } from 'components/security/Guards';
import {
  getStateCodeFromLabel,
  getStateLabelFromCode,
  getStatusStyle,
  states
} from 'components/workflow/StateMachine';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { PlanTableI18N, TableI18N } from 'constants/i18n';
import { SYSTEM_ROLE } from 'constants/roles';
import React, { Fragment, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as utils from 'utils/pagedProjectPlanTableUtils';
import { getDateDiffInMonths, getFormattedDate } from 'utils/Utils';
import { IPlansListProps } from '../user/MyPlans';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';

const PlanListPage: React.FC<IPlansListProps> = (props) => {
  const { plans, drafts, myplan } = props;
  const history = useNavigate();
  const projectAuthStateContext = useContext(ProjectAuthStateContext);

  const isUserCreator = projectAuthStateContext.hasProjectRole([
    SYSTEM_ROLE.SYSTEM_ADMIN,
    SYSTEM_ROLE.DATA_ADMINISTRATOR
  ]);

  let rowsPlanFilterOutArchived = plans;
  if (rowsPlanFilterOutArchived && isUserCreator) {
    rowsPlanFilterOutArchived = plans.filter(
      (plan) => plan.project.state_code != getStateCodeFromLabel(states.ARCHIVED)
    );
  }

  const myPlan = myplan && true === myplan ? true : false;
  const archCode = getStateCodeFromLabel(states.ARCHIVED);
  const rowsPlan = rowsPlanFilterOutArchived
    ?.filter((plan) => !plan.project.is_project)
    .map((row, index) => {
      return {
        id: index,
        planId: row.project.project_id,
        planName: row.project.project_name,
        focus: utils.resolveProjectPlanFocus(
          row.project.is_healing_land,
          row.project.is_healing_people,
          row.project.is_land_initiative,
          row.project.is_cultural_initiative
        ),
        term:
          getDateDiffInMonths(row.project.start_date, row.project.end_date) > 12
            ? PlanTableI18N.multiYear
            : PlanTableI18N.annual,
        org: row.contact.contacts.map((item) => item.organization).join('\r'),
        startDate: row.project.start_date,
        endDate: row.project.end_date,
        statusCode: row.project.state_code,
        statusLabel: getStateLabelFromCode(row.project.state_code),
        statusStyle: getStatusStyle(row.project.state_code),
        archive: row.project.state_code !== archCode ? TableI18N.archive : TableI18N.unarchive,
        export:
          row.project.is_healing_people &&
          !row.project.is_healing_land &&
          !row.project.is_cultural_initiative &&
          !row.project.is_land_initiative
            ? ''
            : 'Yes'
      } as utils.PlanData;
    });

  const draftCode = getStateCodeFromLabel(states.DRAFT);
  const draftStatusStyle = getStatusStyle(draftCode);
  const rowsDraft = drafts
    ? drafts
        .filter((draft) => !draft.is_project)
        .map((row, index) => {
          return {
            id: index + rowsPlan.length,
            planId: row.id,
            planName: row.name,
            focus: '',
            term: '',
            org: '',
            startDate: '',
            endDate: '',
            statusCode: draftCode,
            statusLabel: states.DRAFT,
            statusStyle: draftStatusStyle,
            archive: '',
            export: ''
          } as utils.PlanData;
        })
    : [];

  const rows = rowsDraft.concat(rowsPlan);

  function PlansTableHead(props: utils.PlansTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler =
      (property: keyof utils.PlanData) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
      };

    return (
      <TableHead>
        <TableRow>
          {utils.planHeadCells.map((headCell) => {
            if ('archive' !== headCell.id && 'export' !== headCell.id)
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
              {!myPlan ? (
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
              {!myPlan ? <></> : <Typography variant="inherit">Delete</Typography>}
            </TableCell>
          </SystemRoleGuard>

          {!myPlan ? (
            <TableCell padding="checkbox">
              <Tooltip title={PlanTableI18N.exportAllPlans} placement="right">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={onSelectAllClick}
                  inputProps={{
                    'aria-label': PlanTableI18N.selectAllPlansForExport
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

  interface PlansTableToolbarProps {
    numSelected: number;
  }

  function PlansTableToolbar(props: PlansTableToolbarProps) {
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
            {numSelected} {numSelected !== 1 ? PlanTableI18N.plans : PlanTableI18N.plan}{' '}
            {TableI18N.selectedToExport}
          </Typography>
        ) : (
          <Typography
            sx={{ mx: '0.5rem', flex: '1 1 100%' }}
            variant="h2"
            id="tableTitle"
            component="div">
            {TableI18N.found} {rows?.length}{' '}
            {rows?.length !== 1 ? PlanTableI18N.plans : PlanTableI18N.plan}
          </Typography>
        )}
        {numSelected > 0 ? (
          <Button
            sx={{ height: '2.8rem', width: '10rem', fontWeight: 600 }}
            color="primary"
            variant="outlined"
            disableElevation
            data-testid="export-plan-button"
            aria-label={PlanTableI18N.exportPlansData}
            startIcon={<Icon path={mdiExport} size={1} />}>
            {TableI18N.exportData}
          </Button>
        ) : (
          <InfoDialog isProject={false} infoContent={'paged table'} />
        )}
      </Toolbar>
    );
  }

  function PlanTable() {
    const [order, setOrder] = useState<utils.Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof utils.PlanData>('planName');
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (
      event: React.MouseEvent<unknown>,
      property: keyof utils.PlanData
    ) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        const newSelected = rows.filter((item) => item.export).map((n) => n.id);
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
        <PlansTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}>
            <PlansTableHead
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
                const labelId = `plans-table-checkbox-${index}`;

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
                        data-testid={row.planName}
                        underline="always"
                        component="button"
                        sx={{ textAlign: 'left' }}
                        variant="body2"
                        onClick={
                          draftCode != row.statusCode
                            ? () => history(`/admin/plans/${row.planId}`)
                            : () => history(`/admin/plans/create?draftId=${row.planId}`)
                        }>
                        {row.planName}
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      {row.focus &&
                        row.focus.split('\r').map((focus: string, key) => (
                          <Fragment key={key}>
                            <Box>
                              <Chip
                                data-testid="focus_item"
                                size="small"
                                sx={utils.focusStyles.focusPlanChip}
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
                    <TableCell align="left">{row.term}</TableCell>
                    <TableCell align="left">
                      {row.org &&
                        row.org.split('\r').map((organization: string, key) => (
                          <Fragment key={key}>
                            <Box>
                              <Chip
                                data-testid="organization_item"
                                size="small"
                                sx={utils.orgStyles.orgPlanChip}
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
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.startDate)}
                    </TableCell>
                    <TableCell align="left">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.endDate)}
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
                            title={
                              archCode !== row.statusCode ? TableI18N.archive : TableI18N.unarchive
                            }
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
                    {!myPlan ? (
                      <TableCell padding="checkbox">
                        {row.export ? (
                          <Tooltip
                            title={
                              isItemSelected
                                ? TableI18N.exportSelected
                                : TableI18N.exportNotSelected
                            }
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
                        ) : (
                          <Tooltip title={TableI18N.noDataToExport} placement="right">
                            <span>
                              <Checkbox
                                disabled={true}
                                color="primary"
                                inputProps={{
                                  'aria-labelledby': labelId
                                }}
                              />
                            </span>
                          </Tooltip>
                        )}
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
                  <TableCell colSpan={7} />
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
   * Displays plans list.
   */
  return (
    <Card>
      <PlanTable />
    </Card>
  );
};

export default PlanListPage;
