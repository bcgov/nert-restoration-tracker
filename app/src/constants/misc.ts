import { getStateCodeFromLabel, states } from 'components/workflow/StateMachine';

export enum AdministrativeActivityType {
  SYSTEM_ACCESS = 'System Access'
}

export enum AdministrativeActivityStatusType {
  PENDING = 'Pending',
  ACTIONED = 'Actioned',
  REJECTED = 'Rejected'
}

export enum ProjectStatusType {
  COMPLETED = 'Completed',
  ACTIVE = 'Active',
  DRAFT = 'Draft'
}

export enum attachmentType {
  ATTACHMENTS = 'attachments',
  TREATMENTS = 'treatments'
}

//url for public reference of iucn conservation classification file.
export const ICUN_CONSERVATION_CLASSIFICATION_REFERENCE_URL =
  'https://nrs.objectstore.gov.bc.ca/gblhvt/restoration-tracker/public/CMP%20Conservation%20Actions%20Calssification%20v2.0.xlsx';

// Project or Plan focus options
export const focusOptions = [
  {
    value: 1,
    label: 'Healing the Land'
  },
  {
    value: 2,
    label: 'Healing the People'
  },
  {
    value: 3,
    label: 'Land Based Restoration Initiative'
  },
  {
    value: 4,
    label: 'Cultural or Community Investment Initiative'
  }
];

// Project status options
export const projectStatusOptions = [
  {
    value: getStateCodeFromLabel(states.PLANNING),
    label: states.PLANNING
  },
  {
    value: getStateCodeFromLabel(states.AUTHORIZATION),
    label: states.AUTHORIZATION
  },
  {
    value: getStateCodeFromLabel(states.ACTIVE),
    label: states.ACTIVE
  },
  {
    value: getStateCodeFromLabel(states.REPORTING),
    label: states.REPORTING
  },
  {
    value: getStateCodeFromLabel(states.MONITORING),
    label: states.MONITORING
  },
  {
    value: getStateCodeFromLabel(states.REPORTING2),
    label: states.REPORTING2
  },
  {
    value: getStateCodeFromLabel(states.COMPLETED),
    label: states.COMPLETED
  },
  {
    value: getStateCodeFromLabel(states.ARCHIVED),
    label: states.ARCHIVED
  }
];

// Plan status options
export const planStatusOptions = [
  {
    value: getStateCodeFromLabel(states.PLANNING),
    label: states.PLANNING
  },
  {
    value: getStateCodeFromLabel(states.COMPLETED),
    label: states.COMPLETED
  },
  {
    value: getStateCodeFromLabel(states.ARCHIVED),
    label: states.ARCHIVED
  }
];

export const ICONS = {
  PLAN_ICON: require('assets/images/planIcon.png'),
  PROJECT_ICON: require('assets/images/projectIcon.png')
};
