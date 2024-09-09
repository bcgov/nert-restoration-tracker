import React, { useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FormControl, TextField } from '@mui/material';

interface IRangeSelectProps {
  formikProps: any;
  formFieldName: string;
}

const RangeSelectField = (props: IRangeSelectProps) => {
  const [value, setValue] = useState('');

  const validChars = '0123456789';
  const validSpecialKeys = ['ESC', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Tab', 'Delete'];
  const validSelectRanges = ['', '10', '100', '1000', '10000', '100000', '-1'];

  const ranges = [
    {
      value: '',
      label: 'Select Range'
    },
    {
      value: '10',
      label: '0 - 10'
    },
    {
      value: '100',
      label: '11 - 100'
    },
    {
      value: '1000',
      label: '101 - 1,000'
    },
    {
      value: '10000',
      label: '1,001 - 10,000'
    },
    {
      value: '100000',
      label: '10,001 - 100,000'
    },
    {
      value: '-1',
      label: 'Other - please specify'
    }
  ];

  useEffect(() => {
    if (props.formikProps.values.focus.people_involved) {
      if (!validSelectRanges.includes('' + props.formikProps.values.focus.people_involved)) {
        setValue('-1');
        return;
      }
      setValue('' + props.formikProps.values.focus.people_involved);
    }
  }, [props.formikProps.values.focus.people_involved, value]);

  return (
    <>
      <FormControl variant="standard" sx={{ mt: 0.5, mr: 1, minWidth: 210 }}>
        <Select
          size="small"
          sx={{ my: 0.7 }}
          labelId="range-select-small-label"
          id="range-select-small"
          variant="outlined"
          value={value}
          displayEmpty
          onChange={({ target: { value } }) => {
            setValue(value);
            if (value) {
              props.formikProps.setFieldValue(props.formFieldName, value);
              return;
            }
            props.formikProps.setFieldValue(props.formFieldName, null);
          }}>
          {ranges.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        fullWidth
        sx={{ mt: 0.5, minWidth: 200 }}
        id="numberIntId"
        data-testid="number-int-test"
        aria-label="Number of people"
        placeholder="Number of people"
        variant="outlined"
        value={
          props.formikProps.values.focus.people_involved === '-1' ||
          props.formikProps.values.focus.people_involved === null
            ? ''
            : props.formikProps.values.focus.people_involved
        }
        InputProps={{
          inputProps: {
            maxLength: 7
          }
        }}
        onKeyDown={(event) => {
          if (!validChars.includes(event?.key) && !validSpecialKeys.includes(event?.code)) {
            event.preventDefault();
          }
        }}
        onChange={(event) => {
          const val = event.target.value;
          if (val !== '') {
            props.formikProps.setFieldValue(props.formFieldName, Number(val));
            return;
          }
          setValue('-1');
          props.formikProps.setFieldValue(props.formFieldName, null);
        }}
      />
    </>
  );
};

export default RangeSelectField;
