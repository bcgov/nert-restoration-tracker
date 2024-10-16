import {
  PlanTableI18N,
  ProjectTableI18N,
  TableI18N,
  AppUserReportTableI18N,
  PiMgmtReportTableI18N
} from 'constants/i18n';
import { focus } from 'constants/misc';

/**  Project related objects **/
export interface ProjectData {
  id: number;
  projectId: number;
  projectName: string;
  focus: string;
  org: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  statusCode: number;
  statusLabel: string;
  archive: string;
}

export interface ProjectsTableProps {
  myProject?: boolean;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ProjectData) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

export interface ProjectHeadCell {
  disablePadding: boolean;
  id: keyof ProjectData;
  label: string;
  tooltipLabel?: string;
  infoButton?: string;
  numeric: boolean;
}

export const projectHeadCells: readonly ProjectHeadCell[] = [
  {
    id: 'projectName',
    numeric: false,
    disablePadding: true,
    label: ProjectTableI18N.projectName
  },
  {
    id: 'focus',
    numeric: false,
    disablePadding: true,
    label: ProjectTableI18N.focus,
    tooltipLabel: ProjectTableI18N.focusTooltip,
    infoButton: ProjectTableI18N.focusInfo
  },
  {
    id: 'org',
    numeric: false,
    disablePadding: false,
    label: TableI18N.organizations,
    tooltipLabel: ProjectTableI18N.orgTooltip
  },
  {
    id: 'plannedStartDate',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.plannedStartDate,
    tooltipLabel: ProjectTableI18N.plannedStartDateTooltip
  },
  {
    id: 'actualStartDate',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.actualStartDate,
    tooltipLabel: ProjectTableI18N.actualStartDateTooltip
  },
  {
    id: 'plannedEndDate',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.plannedEndDate,
    tooltipLabel: ProjectTableI18N.plannedEndDateTooltip
  },
  {
    id: 'actualEndDate',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.actualEndDate,
    tooltipLabel: ProjectTableI18N.actualEndDateTooltip
  },
  {
    id: 'statusLabel',
    numeric: false,
    disablePadding: true,
    label: TableI18N.status,
    tooltipLabel: ProjectTableI18N.statusTooltip,
    infoButton: ProjectTableI18N.statusInfo
  },
  {
    id: 'archive',
    numeric: false,
    disablePadding: false,
    label: TableI18N.archive
  }
];

/**  Plan related objects **/
export interface PlanData {
  id: number;
  planId: number;
  planName: string;
  focus: string;
  term: string;
  org: string;
  startDate: string;
  endDate: string;
  statusCode: number;
  statusLabel: string;
  archive: string;
}

export interface PlansTableProps {
  myPlan?: boolean;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof PlanData) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

export interface PlanHeadCell {
  disablePadding: boolean;
  id: keyof PlanData;
  label: string;
  tooltipLabel?: string;
  infoButton?: string;
  numeric: boolean;
}

export const planHeadCells: readonly PlanHeadCell[] = [
  {
    id: 'planName',
    numeric: false,
    disablePadding: true,
    label: PlanTableI18N.planName
  },
  {
    id: 'focus',
    numeric: false,
    disablePadding: true,
    label: PlanTableI18N.focus,
    tooltipLabel: PlanTableI18N.focusTooltip,
    infoButton: PlanTableI18N.focusInfo
  },
  {
    id: 'term',
    numeric: false,
    disablePadding: false,
    label: PlanTableI18N.term,
    tooltipLabel: PlanTableI18N.termTooltip
  },
  {
    id: 'org',
    numeric: false,
    disablePadding: false,
    label: TableI18N.organizations,
    tooltipLabel: PlanTableI18N.orgTooltip
  },
  {
    id: 'startDate',
    numeric: false,
    disablePadding: false,
    label: PlanTableI18N.startDate,
    tooltipLabel: PlanTableI18N.startDateTooltip
  },
  {
    id: 'endDate',
    numeric: false,
    disablePadding: false,
    label: PlanTableI18N.endDate,
    tooltipLabel: PlanTableI18N.endDateTooltip
  },
  {
    id: 'statusLabel',
    numeric: false,
    disablePadding: false,
    label: TableI18N.status,
    tooltipLabel: PlanTableI18N.statusTooltip
  },
  {
    id: 'archive',
    numeric: false,
    disablePadding: false,
    label: TableI18N.archive
  }
];

// Draft related objects
export interface DraftData {
  id: number;
  draftId: number;
  draftName: string;
  statusCode: number;
  statusLabel: string;
  deleteDraft: string;
}

export interface DraftTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof DraftData) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

export interface DraftHeadCell {
  disablePadding: boolean;
  id: keyof DraftData;
  label: string;
  tooltipLabel?: string;
  infoButton?: string;
  numeric: boolean;
}

export const draftHeadCells: readonly DraftHeadCell[] = [
  {
    id: 'draftName',
    numeric: false,
    disablePadding: true,
    label: TableI18N.draftName
  }
];

// Application user report related objects
export interface AppUserReportData {
  id: number;
  user_id: number;
  user_name: string;
  role_names: string;
  prj_count: string;
  plan_count: string;
  arch_prj_count: string;
  arch_plan_count: string;
  draft_prj_count: string;
  draft_plan_count: string;
}

export interface AppUserReportTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof AppUserReportData) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

export interface AppUserReportHeadCell {
  disablePadding: boolean;
  id: keyof AppUserReportData;
  label: string;
  tooltipLabel?: string;
  infoButton?: string;
  numeric: boolean;
}

export const appUserReportHeadCells: readonly AppUserReportHeadCell[] = [
  {
    id: 'user_name',
    numeric: false,
    disablePadding: true,
    label: AppUserReportTableI18N.userName
  },
  {
    id: 'role_names',
    numeric: false,
    disablePadding: false,
    label: AppUserReportTableI18N.role
  },
  {
    id: 'prj_count',
    numeric: false,
    disablePadding: true,
    label: AppUserReportTableI18N.publishedProjects
  },
  {
    id: 'draft_prj_count',
    numeric: false,
    disablePadding: true,
    label: AppUserReportTableI18N.draftProjects
  },
  {
    id: 'arch_prj_count',
    numeric: false,
    disablePadding: true,
    label: AppUserReportTableI18N.archivedProjects
  },
  {
    id: 'plan_count',
    numeric: false,
    disablePadding: true,
    label: AppUserReportTableI18N.publishedPlans
  },
  {
    id: 'draft_plan_count',
    numeric: false,
    disablePadding: true,
    label: AppUserReportTableI18N.draftPlans
  },
  {
    id: 'arch_plan_count',
    numeric: false,
    disablePadding: true,
    label: AppUserReportTableI18N.archivedPlans
  }
];

// PI Management report related objects
export interface PiMgmtReportData {
  id: number;
  project_id: number;
  project_name: string;
  is_project: string;
  user_id: number;
  user_name: string;
  date: string;
  operation: string;
  file_name: string;
  file_type: string;
}

export interface PiMgmtReportTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof PiMgmtReportData) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

export interface PiMgmtReportHeadCell {
  disablePadding: boolean;
  id: keyof PiMgmtReportData;
  label: string;
  tooltipLabel?: string;
  infoButton?: string;
  numeric: boolean;
}

export const piMgmtReportDataHeadCells: readonly PiMgmtReportHeadCell[] = [
  {
    id: 'project_name',
    numeric: false,
    disablePadding: false,
    label: PiMgmtReportTableI18N.prjName
  },
  {
    id: 'user_name',
    numeric: false,
    disablePadding: false,
    label: PiMgmtReportTableI18N.userName
  },
  {
    id: 'date',
    numeric: false,
    disablePadding: false,
    label: PiMgmtReportTableI18N.updateDate
  },
  {
    id: 'operation',
    numeric: false,
    disablePadding: false,
    label: PiMgmtReportTableI18N.updateAction
  },
  {
    id: 'file_type',
    numeric: false,
    disablePadding: false,
    label: PiMgmtReportTableI18N.eventType
  }
];

/** Common to projects and plan table **/
export interface TableToolbarProps {
  numSelected: number;
}

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export type Order = 'asc' | 'desc';

export function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export const authStyles = {
  authChip: {
    backgroundColor: '#E9FBFF',
    marginBottom: '1px',
    justifyContent: 'space-between',
    width: '100%'
  },
  pendingAuthChip: {
    backgroundColor: '#FFFFDD',
    marginBottom: '1px',
    justifyContent: 'space-between',
    width: '100%'
  },
  noAuthChip: {
    justifyContent: 'left',
    fontSize: '0.78rem',
    fontWeight: 500,
    height: '1.5rem'
  },
  authLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export const fundingSrcStyles = {
  fundChip: {
    backgroundColor: '#E9FBFF',
    marginBottom: '1px',
    justifyContent: 'space-between',
    width: '100%'
  },
  noFundChip: {
    justifyContent: 'left',
    fontSize: '0.78rem',
    fontWeight: 500,
    height: '1.5rem'
  },
  fundLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export const orgStyles = {
  orgProjectChip: {
    backgroundColor: '#E9FBFF',
    marginBottom: '1px',
    justifyContent: 'left',
    maxWidth: '230px',
    width: '100%'
  },
  orgPlanChip: {
    backgroundColor: '#FFF4EB',
    marginBottom: '1px',
    justifyContent: 'left',
    maxWidth: '230px',
    width: '100%'
  },
  noOrgChip: {
    justifyContent: 'left',
    fontSize: '0.78rem',
    fontWeight: 500,
    height: '1.5rem'
  },
  orgLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export const focusStyles = {
  focusProjectChip: {
    backgroundColor: '#E9FBFF',
    marginBottom: '1px',
    justifyContent: 'left',
    maxWidth: '210px',
    width: '100%'
  },
  focusPlanChip: {
    backgroundColor: '#FFF4EB',
    marginBottom: '1px',
    justifyContent: 'left',
    maxWidth: '210px',
    width: '100%'
  },
  noFocusChip: {
    justifyContent: 'left',
    fontSize: '0.78rem',
    fontWeight: 500,
    height: '1.5rem'
  },
  focusLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export function resolveProjectPlanFocus(
  isHealingLand: boolean,
  isHealingPeople: boolean,
  isLandInitiative: boolean,
  isCulturalInitiative: boolean
) {
  let resolvedFocusString = '';
  if (isHealingLand) {
    resolvedFocusString += focus.HEALING_THE_LAND;
  }
  if (isHealingPeople) {
    resolvedFocusString += '\r' + focus.HEALING_THE_PEOPLE;
  }
  if (isLandInitiative) {
    resolvedFocusString += '\r' + focus.LAND_BASED_RESTORATION_INITIATIVE;
  }
  if (isCulturalInitiative) {
    resolvedFocusString += '\r' + focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE;
  }
  return resolvedFocusString.trim();
}
