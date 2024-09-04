import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

type IDollarAmountFieldProps = TextFieldProps & {
  required?: boolean;
  id: string;
  label: string;
  name: string;
};

interface NumberFormatCustomProps {
  onChange: (event: { target: { name: string; value: number } }) => void;
  name: string;
}

const NumberFormatCustom = React.forwardRef<NumericFormatProps, NumberFormatCustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values: any) => {
          onChange({
            target: {
              name: props.name,
              value: parseInt(values.value)
            }
          });
        }}
        thousandSeparator
        decimalScale={0}
      />
    );
  }
);

const DollarAmountField: React.FC<IDollarAmountFieldProps> = (props) => {
  const { values, handleChange, touched, errors } = useFormikContext<IDollarAmountFieldProps>();

  const { name, ...rest } = props;

  return (
    <TextField
      {...rest}
      fullWidth
      name={name}
      variant="outlined"
      value={get(values, name)}
      onChange={handleChange}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && get(errors, name)}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
        inputComponent: NumberFormatCustom as any
      }}
      inputProps={{ 'data-testid': name }}
    />
  );
};

export default DollarAmountField;
