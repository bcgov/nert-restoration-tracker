export const states = {
  PLANNING: 'PLANNING',
  AUTHORIZATION: 'AUTHORIZATION',
  ACTIVE: 'ACTIVE',
  REPORTING: 'REPORTING',
  MONITORING: 'MONITORING',
  REPORTING2: 'REPORTING2',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
  DRAFT: 'DRAFT'
};

const statesPlan = {
  PLANNING: 'PLANNING',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
  DRAFT: 'DRAFT'
};

const events = {
  saving: 'saving',
  creating: 'creating',
  archiving: 'archiving',
  unarchiving: 'unarchiving',
  completing: 'completing',
  authorizing: 'authorizing',
  activating: 'activating',
  monitoring: 'monitoring',
  reporting: 'reporting',
  reporting2: 'reporting2'
};

const eventsPlan = {
  saving: 'saving',
  creating: 'creating',
  archiving: 'archiving',
  unarchiving: 'unarchiving',
  completing: 'completing'
};

export const getStateLabelFromCode = (statusCode: number) => {
  return (
    {
      1: states.PLANNING,
      2: states.AUTHORIZATION,
      3: states.ACTIVE,
      4: states.REPORTING,
      5: states.MONITORING,
      6: states.REPORTING2,
      7: states.COMPLETED,
      8: states.ARCHIVED,
      9: states.DRAFT
    }[statusCode] ?? 'UNDEFINED'
  );
};

export const getStateCodeFromLabel = (statusLabel: string) => {
  return (
    {
      [states.PLANNING]: 1,
      [states.AUTHORIZATION]: 2,
      [states.ACTIVE]: 3,
      [states.REPORTING]: 4,
      [states.MONITORING]: 5,
      [states.REPORTING2]: 6,
      [states.COMPLETED]: 7,
      [states.ARCHIVED]: 8,
      [states.DRAFT]: 9
    }[statusLabel] ?? -1
  );
};

const setStateBgColor = (statusCode: number) => {
  return (
    {
      1: '#AA72D4',
      2: '#FFD85B',
      3: '#A2B9E2',
      4: '#7395D3',
      5: '#5F86CD',
      6: '#AAD292',
      7: '#70AD47',
      8: '#FF5D5D',
      9: '#A6A6A6'
    }[statusCode] ?? 'black'
  );
};

export const getStatusStyle = (statusCode: number) => {
  return {
    color: 'white',
    fontWeight: 600,
    letterSpacing: '0.02rem',
    backgroundColor: setStateBgColor(statusCode)
  };
};

const planDefinition = {
  initialState: '',
  [states.DRAFT]: {
    transitions: {
      [events.saving]: {
        target: states.DRAFT
      },
      [events.creating]: {
        target: states.PLANNING
      }
    }
  },
  [states.PLANNING]: {
    transitions: {
      [events.archiving]: {
        target: states.ARCHIVED
      },
      [events.completing]: {
        target: states.COMPLETED
      }
    }
  },
  [states.COMPLETED]: {
    transitions: {
      [events.archiving]: {
        target: states.ARCHIVED
      }
    }
  },
  [states.ARCHIVED]: {
    transitions: {
      [events.unarchiving]: {
        target: states.COMPLETED
      }
    }
  }
};

const projectDefinition = {
  initialState: '',
  [states.DRAFT]: {
    transitions: {
      [events.saving]: {
        target: states.DRAFT
      },
      [events.creating]: {
        target: states.PLANNING
      }
    }
  },
  [states.PLANNING]: {
    transitions: {
      [events.authorizing]: {
        target: states.AUTHORIZATION
      },
      [events.activating]: {
        target: states.ACTIVE
      },
      [events.archiving]: {
        target: states.ARCHIVED
      }
    }
  },
  [states.ACTIVE]: {
    transitions: {
      [events.reporting]: {
        target: states.REPORTING
      },
      [events.archiving]: {
        target: states.ARCHIVED
      }
    }
  },
  [states.REPORTING]: {
    transitions: {
      [events.monitoring]: {
        target: states.MONITORING
      },
      [events.archiving]: {
        target: states.ARCHIVED
      }
    }
  },
  [states.MONITORING]: {
    transitions: {
      [events.activating]: {
        target: states.ACTIVE
      },
      [events.reporting2]: {
        target: states.REPORTING2
      },
      [events.archiving]: {
        target: states.ARCHIVED
      }
    }
  },
  [states.REPORTING2]: {
    transitions: {
      [events.completing]: {
        target: states.COMPLETED
      },
      [events.archiving]: {
        target: states.ARCHIVED
      }
    }
  },
  [states.COMPLETED]: {
    transitions: {
      [events.archiving]: {
        target: states.ARCHIVED
      }
    }
  },
  [states.ARCHIVED]: {
    transitions: {
      [events.unarchiving]: {
        target: states.COMPLETED
      }
    }
  }
};

function createMachine(stateMachineDefinition: any) {
  const finiteStateMachine = {
    state: stateMachineDefinition.initialState,
    transition(currentState: string | number, event: string | number) {
      const fromStateDefinition = stateMachineDefinition[currentState];
      const toTransition = fromStateDefinition.transitions[event];
      if (!toTransition) {
        return 'UNDEFINED:target';
      }
      return toTransition.target;
    }
  };
  return finiteStateMachine;
}

/**
 * Returns next valid status state for a project or plan.
 *
 * @example
 *
 * @param {boolean} type true = project, false = plan
 * @param {string} string current state
 * @param {string} string event to transition
 * @returns {string} string representing the valid next state
 */
const StateMachine = (type: boolean, currentState: string, event: string) => {
  // validate current state is valid
  if (!(currentState in states)) {
    return 'UNDEFINED_STATE:' + currentState;
  }

  // validate event is valid
  if (!(event in events)) {
    return 'UNDEFINED_EVENT:' + event;
  }

  if (type) {
    // project
    projectDefinition.initialState = currentState;
    const projectMachine = createMachine(projectDefinition);
    const state = projectMachine.state;
    return projectMachine.transition(state, event) as string;
  } else {
    // plan
    // validate currentState as part of the plan subset if valid states
    if (!(currentState in statesPlan)) {
      return 'INVALID_PLAN_STATE:' + currentState;
    }

    // validate event as part of the plan subset if valid events
    if (!(event in eventsPlan)) {
      return 'INVALID_PLAN_EVENT:' + event;
    }

    planDefinition.initialState = currentState;
    const planMachine = createMachine(planDefinition);
    const state = planMachine.state;
    return planMachine.transition(state, event) as string;
  }
};

export default StateMachine;
