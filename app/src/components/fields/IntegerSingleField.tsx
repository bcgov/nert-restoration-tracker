import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { FormikContextType, useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';

interface IIntegerSingleFieldProps {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  handleBlur?: FormikContextType<any>['handleBlur'];
  adornment?: string;
}

/**
 * Single area filed input integer only- commonly used throughout forms
 *
 */
const IntegerSingleField: React.FC<IIntegerSingleFieldProps> = (props) => {
  const { touched, errors, values, handleBlur, setFieldValue } = useFormikContext<any>();
  const { name, label, required, helperText, adornment } = props;

  const value = get(values, name);
  const attribAdornment = adornment
    ? { InputProps: { endAdornment: <InputAdornment position="end">{adornment}</InputAdornment> } }
    : {};

  return (
    <TextField
      size="small"
      fullWidth
      id="numberIntId"
      data-testid="number-int-test"
      aria-label={label}
      name={name}
      label={label}
      variant="outlined"
      required={required ? true : false}
      value={value ?? ''}
      inputProps={{
        maxLength: 7
      }}
      {...attribAdornment}
      onChange={(event) => {
        const val = event.target.value;
        if (val.match(/[^0-9]/)) {
          return event.preventDefault();
        }
        setFieldValue(`${name}`, Number(val));
      }}
      onBlur={handleBlur}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={((get(touched, name) && get(errors, name)) as string) || helperText}
      InputLabelProps={{
        shrink: true
      }}
    />
  );
};

export default IntegerSingleField;
