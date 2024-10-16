import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import SpeciesCard from './SpeciesCard';
import React from 'react';

interface ISpeciesSelectedCardProps {
  /**
   * The species to display.
   *
   * @type {IPartialTaxonomy}
   * @memberof ISpeciesSelectedCardProps
   */
  species: IPartialTaxonomy;
  /**
   * Callback to remove a species from the selected species list.
   * If not provided, the remove button will not be displayed.
   *
   * @memberof ISpeciesSelectedCardProps
   */
  handleRemove?: (tsn: number) => void;
  /**
   * The index of the component in the list.
   *
   * @type {number}
   * @memberof ISpeciesSelectedCardProps
   */
  index: number;
  /**
   * Optional styles to apply to the component.
   *
   * @type {any}
   * @memberof ISpeciesSelectedCardProps
   */
  sx?: any;
}

const SpeciesSelectedCard = (props: ISpeciesSelectedCardProps) => {
  const { index, species, handleRemove, sx } = props;

  return (
    <Paper
      variant="outlined"
      sx={sx ? sx : { ...sx, mt: 1, background: grey[100] }}
      role="listitem"
      aria-label={`Species ${index + 1}: ${species.commonNames}`}>
      <Box display="flex" alignItems="center" px={2} py={1.5}>
        <Box flex="1 1 auto">
          <SpeciesCard taxon={species} />
        </Box>
        {handleRemove && (
          <Box flex="0 0 auto">
            <IconButton
              data-testid={`remove-species-button-${index}`}
              sx={{
                ml: 2
              }}
              aria-label={`remove species ${species.commonNames}`}
              onClick={() => handleRemove(species.tsn)}>
              <Icon path={mdiClose} size={1}></Icon>
            </IconButton>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SpeciesSelectedCard;
