import Grid from '@mui/material/Grid';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useNertApi } from 'hooks/useNertApi';
import { debounce } from 'lodash-es';
import React, { useCallback } from 'react';

export interface IProjectFocalSpeciesForm {
  species: {
    focal_species: number[];
  };
}

export const ProjectFocalSpeciesFormInitialValues: IProjectFocalSpeciesForm = {
  species: {
    focal_species: []
  }
};

/**
 * Create project - Focal Species
 *
 * @return {*}
 */
const ProjectFocalSpeciesForm: React.FC = () => {
  const restorationTrackerApi = useNertApi();

  const convertOptions = (value: any): IMultiAutocompleteFieldOption[] =>
    value.map((item: any) => {
      return { value: parseInt(item.id), label: item.label };
    });

  const handleGetInitList = async (initialvalues: number[]) => {
    const response = await restorationTrackerApi.taxonomy.getSpeciesFromIds(initialvalues);
    return convertOptions(response.searchResponse);
  };

  const handleSearch = useCallback(
    debounce(
      async (
        inputValue: string,
        existingValues: (string | number)[],
        callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
      ) => {
        const response = await restorationTrackerApi.taxonomy.searchSpecies(inputValue);
        const newOptions = convertOptions(response.searchResponse).filter(
          (item) => !existingValues.includes(item.value)
        );
        callback(newOptions);
      },
      500
    ),
    []
  );

  return (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} md={11.14}>
        <MultiAutocompleteFieldVariableSize
          id="species.focal_species"
          label="Focal Species"
          required={false}
          type="api-search"
          getInitList={handleGetInitList}
          search={handleSearch}
        />
      </Grid>
    </Grid>
  );
};

export default ProjectFocalSpeciesForm;
