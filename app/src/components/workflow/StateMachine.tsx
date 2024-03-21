
const states = {
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

export const getStatusLabelFromCode = (statusCode: number) => {
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

const setStatusBgColor = (statusCode: number) => {
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
    backgroundColor: setStatusBgColor(statusCode) 
  };
};

const StateMachine = (type: boolean, currentState: number,) => {
  //[OI] TODO
  let nextState = currentState;
  if (type)
    nextState = 5;

  return nextState as number;
};

export default StateMachine;