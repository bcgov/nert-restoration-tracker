import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Box } from '@mui/material';

const pageStyles = {
  itemChip: {
    backgroundColor: '#E9FBFF',
    marginBottom: '2px',
    justifyContent: 'left'
  },
  itemLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export interface IProjectFocusSpeciesProps {
  projectViewData: IGetProjectForViewResponse;
}

const focalSpeciesStyled = (item: string) => {
  return (
    <Tooltip title={item} disableHoverListener={item.length < 130}>
      <Typography sx={pageStyles.itemLabel} aria-label={`${item}`}>
        &#x2022; {item}
      </Typography>
    </Tooltip>
  );
};

/**
 * Focal Species content for a project.
 *
 * @return {*}
 */
const ProjectFocalSpecies: React.FC<IProjectFocusSpeciesProps> = (props) => {
  const {
    projectViewData: { species }
  } = props;

  return (
    <Box mt={1}>
      <Typography sx={{ fontWeight: 'bold' }} variant="subtitle2">
        Project Focal Species:
      </Typography>
      <Box display="flex" flexDirection={'column'} alignItems="left">
        {species.focal_species_names?.length ? (
          species.focal_species_names.map((item: any, index: number) => {
            return (
              <Chip
                key={index}
                data-testid="focal_species_data"
                size="small"
                sx={pageStyles.itemChip}
                label={focalSpeciesStyled(item)}
              />
            );
          })
        ) : (
          <Chip label="No Focal Species" data-testid="no_objective_loaded" />
        )}
      </Box>
    </Box>
  );
};

export default ProjectFocalSpecies;
