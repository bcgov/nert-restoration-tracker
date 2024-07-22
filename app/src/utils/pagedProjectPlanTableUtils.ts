import { PlanTableI18N, ProjectTableI18N, TableI18N } from 'constants/i18n';

/**  Project related objects **/
export interface ProjectData {
  id: number;
  projectId: number;
  projectName: string;
  authType: string;
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
    id: 'authType',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.authorizationType
  },
  {
    id: 'org',
    numeric: false,
    disablePadding: false,
    label: TableI18N.organizations
  },
  {
    id: 'plannedStartDate',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.plannedStartDate
  },
  {
    id: 'actualStartDate',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.actualStartDate
  },
  {
    id: 'plannedEndDate',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.plannedEndDate
  },
  {
    id: 'actualEndDate',
    numeric: false,
    disablePadding: false,
    label: ProjectTableI18N.actualEndDate
  },
  {
    id: 'statusLabel',
    numeric: false,
    disablePadding: false,
    label: TableI18N.status
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
  term: string;
  org: string;
  startDate: string;
  endDate: string;
  statusCode: number;
  statusLabel: string;
  archive: string;
  export: string;
}

export interface PlansTableProps {
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
    id: 'term',
    numeric: false,
    disablePadding: false,
    label: PlanTableI18N.term
  },
  {
    id: 'org',
    numeric: false,
    disablePadding: false,
    label: TableI18N.organizations
  },
  {
    id: 'startDate',
    numeric: false,
    disablePadding: false,
    label: PlanTableI18N.startDate
  },
  {
    id: 'endDate',
    numeric: false,
    disablePadding: false,
    label: PlanTableI18N.endDate
  },
  {
    id: 'statusLabel',
    numeric: false,
    disablePadding: false,
    label: TableI18N.status
  },
  {
    id: 'archive',
    numeric: false,
    disablePadding: false,
    label: TableI18N.archive
  },
  {
    id: 'export',
    numeric: false,
    disablePadding: false,
    label: TableI18N.export
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
