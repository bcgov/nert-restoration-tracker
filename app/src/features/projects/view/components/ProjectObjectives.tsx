import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Box } from '@mui/material';

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
      <Typography sx={pageStyles.objectiveLabel} aria-label={`Objective: ${objective}`}>
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
    projectViewData: { objective }
  } = props;
  const hasObjectives = objective.objectives && objective.objectives.length > 0;
  return (
    <Box mt={1} role="region" aria-labelledby="project_objectives_header">
      <Typography
        sx={{ fontWeight: 'bold' }}
        variant="subtitle2"
        component="h2"
        id="project_objectives_header">
        Project Objectives:
      </Typography>
      <Box display="flex" flexDirection={'column'} alignItems="left">
        {hasObjectives &&
          objective.objectives.map((item: { objective: string }, index) => (
            <Chip
              key={index}
              data-testid="objective_item"
              size="small"
              sx={pageStyles.objectiveChip}
              label={objectiveStyled(item.objective)}
              aria-label={`Objective ${index + 1}`}
            />
          ))}

        {!hasObjectives && (
          <Chip
            label="No Objectives"
            data-testid="no_objective_loaded"
            aria-label="No Objectives"
          />
        )}
      </Box>
    </Box>
  );
};

export default ProjectObjectives;
