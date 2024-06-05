import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

const pageStyles = {
  objectiveChip: {
    backgroundColor: '#E9FBFF',
    marginBottom: '2px',
    justifyContent: 'left'
  },
  objectiveLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export interface IProjectObjectivesProps {
  projectViewData: IGetProjectForViewResponse;
}

const objectiveStyled = (objective: string) => {
  return (
    <Tooltip title={objective} disableHoverListener={objective.length < 130}>
      <Typography sx={pageStyles.objectiveLabel} aria-label={`${objective}`}>
        &#x2022; {objective}
      </Typography>
    </Tooltip>
  );
};

/**
 * Objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectViewData: { objectives }
  } = props;

  const hasObjectives = objectives.objectives && objectives.objectives.length > 0;

  return (
    <>
      {hasObjectives &&
        objectives.objectives.map((item: string, index) => (
          <Chip
            key={index}
            data-testid="objective_item"
            size="small"
            sx={pageStyles.objectiveChip}
            label={objectiveStyled(item)}
          />
        ))}

      {!hasObjectives && <Chip label="No Objectives" data-testid="no_objective_loaded" />}
    </>
  );
};

export default ProjectObjectives;
