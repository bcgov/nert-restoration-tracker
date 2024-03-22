import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import get from 'lodash-es/get';
import React from 'react';

interface IStartEndDateFieldsProps {
  formikProps: any;
  startName: string;
  endName: string;
  startRequired: boolean;
  endRequired: boolean;
  startDateHelperText?: string;
  endDateHelperText?: string;
}

/**
 * Start/end date fields - commonly used throughout forms
 *
 */
const ProjectStartEndDateFields: React.FC<IStartEndDateFieldsProps> = (props) => {
  const {
    formikProps: { values, handleChange, errors, touched },
    startName,
    endName,
    startRequired,
    endRequired,
    startDateHelperText,
    endDateHelperText
  } = props;

  const rawStartDateValue = get(values, startName);
  const rawEndDateValue = get(values, endName);

  const formattedStartDateValue =
    (rawStartDateValue &&
      dayjs(rawStartDateValue).isValid() &&
      dayjs(rawStartDateValue).format(DATE_FORMAT.ShortDateFormat)) ||
    '';

  const formattedEndDateValue =
    (rawEndDateValue &&
      dayjs(rawEndDateValue).isValid() &&
      dayjs(rawEndDateValue).format(DATE_FORMAT.ShortDateFormat)) ||
    '';

  return (
    <Grid container item spacing={1.5}>
      <Grid item xs={12} md={3}>
        <TextField
          size="small"
          fullWidth
          id="start_date"
          data-testid="start_date"
          name={startName}
          label="Planned Start Date"
          variant="outlined"
          required={startRequired}
          value={formattedStartDateValue}
          type="date"
          InputProps={{
            // Chrome min/max dates
            inputProps: { min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'start-date' }
          }}
          inputProps={{
            // Firefox min/max dates
            min: DATE_LIMIT.min,
            max: DATE_LIMIT.max,
            'data-testid': 'start-date'
          }}
          onChange={handleChange}
          error={get(touched, startName) && Boolean(get(errors, startName))}
          helperText={(get(touched, startName) && get(errors, startName)) || startDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          size="small"
          fullWidth
          id="start_date"
          data-testid="start_date"
          name={startName}
          label="Actual Start Date"
          variant="outlined"
          required={startRequired}
          value={formattedStartDateValue}
          type="date"
          InputProps={{
            // Chrome min/max dates
            inputProps: { min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'start-date' }
          }}
          inputProps={{
            // Firefox min/max dates
            min: DATE_LIMIT.min,
            max: DATE_LIMIT.max,
            'data-testid': 'start-date'
          }}
          onChange={handleChange}
          error={get(touched, startName) && Boolean(get(errors, startName))}
          helperText={(get(touched, startName) && get(errors, startName)) || startDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          size="small"
          fullWidth
          id="end_date"
          data-testid="end_date"
          name={endName}
          label="Planned End Date"
          variant="outlined"
          required={endRequired}
          value={formattedEndDateValue}
          type="date"
          InputProps={{
            // Chrome min/max dates
            inputProps: {
              min: formattedStartDateValue,
              max: DATE_LIMIT.max,
              'data-testid': 'end-date'
            }
          }}
          inputProps={{
            // Firefox min/max dates
            min: formattedStartDateValue,
            max: DATE_LIMIT.max,
            'data-testid': 'end-date'
          }}
          onChange={handleChange}
          error={get(touched, endName) && Boolean(get(errors, endName))}
          helperText={(get(touched, endName) && get(errors, endName)) || endDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          size="small"
          fullWidth
          id="end_date"
          data-testid="end_date"
          name={endName}
          label="Actual End Date"
          variant="outlined"
          required={endRequired}
          value={formattedEndDateValue}
          type="date"
          InputProps={{
            // Chrome min/max dates
            inputProps: {
              min: formattedStartDateValue,
              max: DATE_LIMIT.max,
              'data-testid': 'end-date'
            }
          }}
          inputProps={{
            // Firefox min/max dates
            min: formattedStartDateValue,
            max: DATE_LIMIT.max,
            'data-testid': 'end-date'
          }}
          onChange={handleChange}
          error={get(touched, endName) && Boolean(get(errors, endName))}
          helperText={(get(touched, endName) && get(errors, endName)) || endDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
    </Grid>
  );
};

export default ProjectStartEndDateFields;
