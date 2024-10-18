import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNertApi } from 'hooks/useNertApi';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';

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

/**
 * Focal Species content for a project.
 *
 * @return {*}
 */
const ProjectFocalSpecies: React.FC<IProjectFocusSpeciesProps> = (props) => {
  const {
    projectViewData: { species }
  } = props;

  const nertApi = useNertApi();

  const [speciesData, setSpeciesData] = React.useState<any>([]);

  const getSpecies = async (tsns: number[]) => {
    const speciesData = await nertApi.taxonomy.getSpeciesFromIds(tsns);
    setSpeciesData(speciesData);
  };

  useEffect(() => {
    if (species.focal_species?.length) {
      getSpecies(species.focal_species);
    }
  }, [species.focal_species]);

  return (
    <Box mt={1} role="region" aria-labelledby="focal_species_header">
      <Typography
        sx={{ fontWeight: 'bold' }}
        variant="subtitle2"
        component="h3"
        id="focal_species_header">
        Wildlife and/or fish species expected to benefit from project:
      </Typography>
      <Box display="flex" flexDirection={'column'} alignItems="left">
        {speciesData && speciesData?.length ? (
          speciesData.map((item: any, index: number) => {
            return (
              <SpeciesSelectedCard
                key={index}
                species={item}
                index={index}
                sx={pageStyles.itemChip}
                aria-label={`Species ${index + 1}: ${item.common_name}`}
              />
            );
          })
        ) : (
          <Chip
            label="No Assigned Species"
            data-testid="no_objective_loaded"
            aria-label="No Assigned Species"
          />
        )}
      </Box>
    </Box>
  );
};

export default ProjectFocalSpecies;
