import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';

export interface IAutocompleteFreeSoloField {
  id: string;
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  filterLimit?: number;
}

const AutocompleteFreeSoloField: React.FC<IAutocompleteFreeSoloField> = (props) => {
  const { touched, errors, setFieldValue, values } = useFormikContext<any>();

  const { id, label, name, options, required, filterLimit } = props;

  return (
    <Autocomplete
      freeSolo
      autoSelect
      includeInputInList
      clearOnBlur
      blurOnSelect
      handleHomeEndKeys
      id={id}
      data-testid={id}
      value={get(values, name)}
      options={options}
      getOptionLabel={(option: any) => option}
      filterOptions={createFilterOptions({ limit: filterLimit })}
      onChange={(event: any, option: any) => {
        setFieldValue(name, option);
      }}
      renderInput={(params: any) => (
        <TextField
          {...params}
          required={required}
          label={label}
          variant="outlined"
          fullWidth
          error={get(touched, name) && Boolean(get(errors, name))}
          helperText={get(touched, name) && (get(errors, name) as string)}
        />
      )}
    />
  );
};

export default AutocompleteFreeSoloField;
