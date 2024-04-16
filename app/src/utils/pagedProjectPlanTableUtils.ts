/**  Project related objects **/
export interface ProjectData {
  id: number;
  projectId: number;
  projectName: string;
  authRef: string;
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
    label: 'Project Name'
  },
  {
    id: 'authRef',
    numeric: false,
    disablePadding: false,
    label: 'Authorization Ref.'
  },
  {
    id: 'org',
    numeric: false,
    disablePadding: false,
    label: 'Organizations'
  },
  {
    id: 'plannedStartDate',
    numeric: false,
    disablePadding: false,
    label: 'Planned Start Date'
  },
  {
    id: 'actualStartDate',
    numeric: false,
    disablePadding: false,
    label: 'Actual Start Date'
  },
  {
    id: 'plannedEndDate',
    numeric: false,
    disablePadding: false,
    label: 'Planned End Date'
  },
  {
    id: 'actualEndDate',
    numeric: false,
    disablePadding: false,
    label: 'Actual End Date'
  },
  {
    id: 'statusLabel',
    numeric: false,
    disablePadding: false,
    label: 'Status'
  },
  {
    id: 'archive',
    numeric: false,
    disablePadding: false,
    label: 'Archive'
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
    label: 'Plan Name'
  },
  {
    id: 'term',
    numeric: false,
    disablePadding: false,
    label: 'Term'
  },
  {
    id: 'org',
    numeric: false,
    disablePadding: false,
    label: 'Organizations'
  },
  {
    id: 'startDate',
    numeric: false,
    disablePadding: false,
    label: 'Start Date'
  },
  {
    id: 'endDate',
    numeric: false,
    disablePadding: false,
    label: 'End Date'
  },
  {
    id: 'statusLabel',
    numeric: false,
    disablePadding: false,
    label: 'Status'
  },
  {
    id: 'archive',
    numeric: false,
    disablePadding: false,
    label: 'Archive'
  },
  {
    id: 'export',
    numeric: false,
    disablePadding: false,
    label: 'Export'
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
