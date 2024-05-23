import { mdiCalendarEnd, mdiCalendarStart } from '@mdi/js';
import Icon from '@mdi/react';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import get from 'lodash-es/get';
import React from 'react';

interface IStartEndDateFieldsProps {
  formikProps: any;
  plannedStartName: string;
  plannedEndName: string;
  plannedStartRequired: boolean;
  plannedEndRequired: boolean;
  actualStartName: string;
  actualEndName: string;
  actualStartRequired: boolean;
  actualEndRequired: boolean;
}

const CalendarStartIcon = () => {
  return <Icon path={mdiCalendarStart} size={1} />;
};

const CalendarEndIcon = () => {
  return <Icon path={mdiCalendarEnd} size={1} />;
};

/**
 * Start/end date fields - commonly used throughout forms
 *
 */
const ProjectStartEndDateFields: React.FC<IStartEndDateFieldsProps> = (props) => {
  const {
    formikProps: { values, errors, touched, setFieldValue },
    plannedStartName,
    plannedEndName,
    plannedStartRequired,
    plannedEndRequired,
    actualStartName,
    actualEndName,
    actualStartRequired,
    actualEndRequired
  } = props;

  const rawPlannedStartDateValue = get(values, plannedStartName);
  const rawPlannedEndDateValue = get(values, plannedEndName);
  const rawActualStartDateValue = get(values, actualStartName);
  const rawActualEndDateValue = get(values, actualEndName);

  const formattedPlannedStartDateValue =
    (rawPlannedStartDateValue &&
      dayjs(rawPlannedStartDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawPlannedStartDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  const formattedPlannedEndDateValue =
    (rawPlannedEndDateValue &&
      dayjs(rawPlannedEndDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawPlannedEndDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  const formattedActualStartDateValue =
    (rawActualStartDateValue &&
      dayjs(rawActualStartDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawActualStartDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  const formattedActualEndDateValue =
    (rawActualEndDateValue &&
      dayjs(rawActualEndDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawActualEndDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container item spacing={1.5}>
        <Grid item xs={3}>
          <DatePicker
            slots={{
              openPickerIcon: CalendarStartIcon
            }}
            slotProps={{
              textField: {
                size: 'small',
                id: 'planned_start_date',
                name: plannedStartName,
                required: plannedStartRequired,
                variant: 'outlined',
                error: get(touched, plannedStartName) && Boolean(get(errors, plannedStartName)),
                helperText: get(touched, plannedStartName) && get(errors, plannedStartName),
                inputProps: {
                  'data-testid': 'planned_start_date'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="Planned Start Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedPlannedStartDateValue}
            onChange={(value) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setFieldValue(plannedStartName, null);
                return;
              }

              setFieldValue(plannedStartName, dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <DatePicker
            slots={{
              openPickerIcon: CalendarEndIcon
            }}
            slotProps={{
              textField: {
                size: 'small',
                id: 'planned_end_date',
                name: plannedEndName,
                required: plannedEndRequired,
                variant: 'outlined',
                error: get(touched, plannedEndName) && Boolean(get(errors, plannedEndName)),
                helperText: get(touched, plannedEndName) && get(errors, plannedEndName),
                inputProps: {
                  'data-testid': 'planned_end_date'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="Planned End Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedPlannedEndDateValue}
            onChange={(value: dayjs.Dayjs | null) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setFieldValue(plannedEndName, null);
                return;
              }

              setFieldValue(plannedEndName, dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <DatePicker
            slots={{
              openPickerIcon: CalendarStartIcon
            }}
            slotProps={{
              textField: {
                size: 'small',
                id: 'actual_start_date',
                name: actualStartName,
                required: actualStartRequired,
                variant: 'outlined',
                error: get(touched, actualStartName) && Boolean(get(errors, actualStartName)),
                helperText: get(touched, actualStartName) && get(errors, actualStartName),
                inputProps: {
                  'data-testid': 'actual_start_date'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="Actual Start Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedActualStartDateValue}
            onChange={(value) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setFieldValue(actualStartName, null);
                return;
              }

              setFieldValue(actualStartName, dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <DatePicker
            slots={{
              openPickerIcon: CalendarEndIcon
            }}
            slotProps={{
              textField: {
                size: 'small',
                id: 'actual_end_date',
                name: actualEndName,
                required: actualEndRequired,
                variant: 'outlined',
                error: get(touched, actualEndName) && Boolean(get(errors, actualEndName)),
                helperText: get(touched, actualEndName) && get(errors, actualEndName),
                inputProps: {
                  'data-testid': 'actual_end_date'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="Actual End Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedActualEndDateValue}
            onChange={(value: dayjs.Dayjs | null) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setFieldValue(actualEndName, null);
                return;
              }

              setFieldValue(actualEndName, dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default ProjectStartEndDateFields;
