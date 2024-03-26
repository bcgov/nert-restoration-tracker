import TextField from '@mui/material/TextField';
import { FormikContextType, useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
export interface ICustomTextField {
  label: string;
  name: string;
  other?: any;
  handleBlur?: FormikContextType<any>['handleBlur'];
  maxLength?: number;
}

const CustomTextField: React.FC<React.PropsWithChildren<ICustomTextField>> = (props) => {
  const { touched, errors, values, handleChange, handleBlur } = useFormikContext<any>();

  const { name, label, other } = props;

  return (
    <TextField
      size="small"
      name={name}
      label={label}
      id={name}
      inputProps={{ 'data-testid': name, maxLength: props.maxLength || undefined }}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      value={get(values, name) ?? ''}
      fullWidth={true}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && (get(errors, name) as string)}
      {...other}
    />
  );
};

export default CustomTextField;
