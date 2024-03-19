import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React, { SyntheticEvent } from 'react';

export interface IAutocompleteFieldOption<T extends string | number> {
  value: T;
  label: string;
}

export interface IAutocompleteField<T extends string | number> {
  id: string;
  label: string;
  name: string;
  options: IAutocompleteFieldOption<T>[];
  required?: boolean;
  filterLimit?: number;
  onChange?: (
    event: SyntheticEvent<Element, Event>,
    option: IAutocompleteFieldOption<T> | null
  ) => void;
}

// To be used when you want an autocomplete field with no freesolo allowed but only one option can be selected

const AutocompleteField = <T extends string | number>(props: IAutocompleteField<T>) => {
  const { touched, errors, setFieldValue, values } =
    useFormikContext<IAutocompleteFieldOption<T>>();

  const getExistingValue = (existingValue: T): IAutocompleteFieldOption<T> => {
    const result = props.options.find((option) => existingValue === option.value);

    if (!result) {
      return null as unknown as IAutocompleteFieldOption<T>;
    }

    return result;
  };

  const handleGetOptionSelected = (
    option: IAutocompleteFieldOption<T>,
    value: IAutocompleteFieldOption<T>
  ): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
  };

  return (
    <Autocomplete
      autoSelect
      clearOnBlur
      blurOnSelect
      handleHomeEndKeys
      id={props.id}
      data-testid={props.id}
      value={getExistingValue(get(values, props.name))}
      options={props.options}
      getOptionLabel={(option: { label: any }) => option.label}
      isOptionEqualToValue={handleGetOptionSelected}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      onChange={(
        event: React.SyntheticEvent<Element, Event>,
        option: IAutocompleteFieldOption<T> | null
      ) => {
        if (props.onChange) {
          props.onChange(event, option);
          return;
        }

        setFieldValue(props.name, option?.value);
      }}
      renderInput={(params: any) => (
        <TextField
          {...params}
          name={props.name}
          required={props.required}
          label={props.label}
          variant="outlined"
          fullWidth
          error={get(touched, props.name) && Boolean(get(errors, props.name))}
          helperText={get(touched, props.name) && get(errors, props.name)}
        />
      )}
    />
  );
};

export default AutocompleteField;
