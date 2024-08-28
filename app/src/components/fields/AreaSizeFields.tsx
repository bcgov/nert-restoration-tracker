import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { AREA_SIZE_MIN_MAX } from 'constants/misc';
import get from 'lodash-es/get';
import React from 'react';

interface IAreaSizeFieldsProps {
  formikProps: any;
  minName: string;
  maxName: string;
  minRequired: boolean;
  maxRequired: boolean;
  minHelperText?: string;
  maxHelperText?: string;
}

/**
 * Start/end date fields - commonly used throughout forms
 *
 */
const AreaSizeFields: React.FC<IAreaSizeFieldsProps> = (props) => {
  const {
    formikProps: { values, handleChange, errors, touched },
    minName,
    maxName,
    minRequired,
    maxRequired,
    minHelperText,
    maxHelperText
  } = props;

  const minValue = get(values, minName);
  const maxValue = get(values, maxName);

  return (
    <Grid container item spacing={3}>
      <Grid item xs={12} md={2}>
        <TextField
          size="small"
          fullWidth
          id="min_area"
          data-testid="min_area"
          name={minName}
          label="From"
          variant="outlined"
          required={minRequired}
          value={minValue}
          defaultValue={AREA_SIZE_MIN_MAX.min}
          type="number"
          InputProps={{
            // Chrome min/max area
            inputProps: {
              min: AREA_SIZE_MIN_MAX.min,
              max: AREA_SIZE_MIN_MAX.max,
              'data-testid': 'min-area'
            },
            endAdornment: <InputAdornment position="end">Ha</InputAdornment>
          }}
          inputProps={{
            // Firefox min/max area
            min: AREA_SIZE_MIN_MAX.min,
            max: AREA_SIZE_MIN_MAX.max,
            'data-testid': 'min-area'
          }}
          onChange={handleChange}
          error={get(touched, minName) && Boolean(get(errors, minName))}
          helperText={(get(touched, minName) && get(errors, minName)) || minHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item xs={12} md={2}>
        <TextField
          size="small"
          fullWidth
          id="max_area"
          data-testid="max_area"
          name={maxName}
          label="To"
          variant="outlined"
          required={maxRequired}
          value={maxValue}
          type="number"
          InputProps={{
            // Chrome min/max dates
            inputProps: {
              min: minValue,
              max: AREA_SIZE_MIN_MAX.max,
              'data-testid': 'max-area'
            },
            endAdornment: <InputAdornment position="end">Ha</InputAdornment>
          }}
          inputProps={{
            // Firefox min/max dates
            min: minValue,
            max: AREA_SIZE_MIN_MAX.max,
            'data-testid': 'max-area'
          }}
          onChange={handleChange}
          error={get(touched, maxName) && Boolean(get(errors, maxName))}
          helperText={(get(touched, maxName) && get(errors, maxName)) || maxHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
    </Grid>
  );
};

export default AreaSizeFields;
