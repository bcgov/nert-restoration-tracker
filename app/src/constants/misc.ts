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

// Project or Plan focus options
export const focus = {
  HEALING_THE_LAND: 'Healing the Land',
  HEALING_THE_PEOPLE: 'Healing the People',
  LAND_BASED_RESTOTRATION_INITIATIVE: 'Land Based Restoration Initiative',
  CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE: 'Cultural or Community Investment Initiative'
};

export const getFocusLabelFromCode = (focusCode: number) => {
  return (
    {
      1: focus.HEALING_THE_LAND,
      2: focus.HEALING_THE_PEOPLE,
      3: focus.LAND_BASED_RESTOTRATION_INITIATIVE,
      4: focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE
    }[focusCode] ?? 'UNDEFINED'
  );
};

export const getFocusCodeFromLabel = (focusLabel: string): number => {
  return (
    {
      [focus.HEALING_THE_LAND]: 1,
      [focus.HEALING_THE_PEOPLE]: 2,
      [focus.LAND_BASED_RESTOTRATION_INITIATIVE]: 3,
      [focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE]: 4
    }[focusLabel] ?? -1
  );
};

export const focusOptions = [
  {
    value: getFocusCodeFromLabel(focus.HEALING_THE_LAND),
    label: focus.HEALING_THE_LAND
  },
  {
    value: getFocusCodeFromLabel(focus.HEALING_THE_PEOPLE),
    label: focus.HEALING_THE_PEOPLE
  },
  {
    value: getFocusCodeFromLabel(focus.LAND_BASED_RESTOTRATION_INITIATIVE),
    label: focus.LAND_BASED_RESTOTRATION_INITIATIVE
  },
  {
    value: getFocusCodeFromLabel(focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE),
    label: focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE
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

export enum AREA_SIZE_MIN_MAX {
  min = 0,
  max = 9999999
}
