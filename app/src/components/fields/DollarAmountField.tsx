import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React, { useState } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import InfoContent from 'components/info/InfoContent';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';

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
  const [infoOpen, setInfoOpen] = useState(false);

  const { name, label, ...rest } = props;

  const handleClickOpen = () => {
    setInfoOpen(true);
  };

  return (
    <>
      <InfoDialogDraggable
        isProject={true}
        open={infoOpen}
        dialogTitle={label}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={true} contentIndex={label} />
      </InfoDialogDraggable>

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
          endAdornment: (
            <IconButton edge="end" onClick={() => handleClickOpen()}>
              <InfoIcon color="info" />
            </IconButton>
          ),
          inputComponent: NumberFormatCustom as any
        }}
        inputProps={{ 'data-testid': name }}
      />
    </>
  );
};

export default DollarAmountField;
