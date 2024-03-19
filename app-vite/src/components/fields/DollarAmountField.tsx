import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
import { NumericFormat } from 'react-number-format';

export interface IDollarAmountFieldProps {
  required?: boolean;
  id: string;
  label: string;
  name: string;
}

interface NumberFormatCustomProps {
  inputRef: (instance: typeof NumericFormat | null) => void;
  onChange: (event: { target: { name: string; value: number } }) => void;
  name: string;
}

function NumberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props;
  return (
    <NumericFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: parseInt(values.value)
          }
        });
      }}
      thousandSeparator
      prefix="$"
      decimalScale={0}
    />
  );
}

const DollarAmountField: React.FC<IDollarAmountFieldProps> = (props) => {
  const { values, handleChange, touched, errors } = useFormikContext<IDollarAmountFieldProps>();

  const { required, id, name, label } = props;

  return (
    <TextField
      fullWidth
      required={required}
      id={id}
      name={name}
      label={label}
      variant="outlined"
      value={get(values, name)}
      onChange={handleChange}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && (get(errors, name) as string)}
      InputLabelProps={{
        shrink: true
      }}
      InputProps={{
        inputComponent: NumberFormatCustom as any
      }}
      inputProps={{ 'data-testid': name }}
    />
  );
};

export default DollarAmountField;