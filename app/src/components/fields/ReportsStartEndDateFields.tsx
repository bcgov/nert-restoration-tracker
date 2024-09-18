import { mdiCalendarEnd, mdiCalendarStart } from '@mdi/js';
import Icon from '@mdi/react';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import React, { useState } from 'react';

interface IReportsStartEndDateFieldsProps {
  startRequired: boolean;
  endRequired: boolean;
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
const ReportsStartEndDateFields: React.FC<IReportsStartEndDateFieldsProps> = (props) => {
  const { startRequired, endRequired } = props;

  const [rawStartDateValue, setRawStartDateValue] = useState('');
  const [rawEndDateValue, setRawEndDateValue] = useState('');

  const formattedStartDateValue =
    (rawStartDateValue &&
      dayjs(rawStartDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawStartDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  const formattedEndDateValue =
    (rawEndDateValue &&
      dayjs(rawEndDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawEndDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container item spacing={1.5}>
        <Grid item xs={6}>
          <DatePicker
            slots={{
              openPickerIcon: CalendarStartIcon
            }}
            slotProps={{
              textField: {
                size: 'small',
                id: 'start_date',
                required: startRequired,
                variant: 'outlined',
                // error: get(touched, startName) && Boolean(get(errors, startName)),
                // helperText: get(touched, startName) && get(errors, startName),
                inputProps: {
                  'data-testid': 'start_date'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="Start Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedStartDateValue}
            onChange={(value) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setRawStartDateValue('');
                return;
              }

              setRawStartDateValue(dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            slots={{
              openPickerIcon: CalendarEndIcon
            }}
            slotProps={{
              textField: {
                size: 'small',
                id: 'end_date',
                required: endRequired,
                variant: 'outlined',
                // error: get(touched, endName) && Boolean(get(errors, endName)),
                // helperText: get(touched, endName) && get(errors, endName),
                inputProps: {
                  'data-testid': 'end_date'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="End Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedEndDateValue}
            onChange={(value: dayjs.Dayjs | null) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setRawEndDateValue('');
                return;
              }

              setRawEndDateValue(dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default ReportsStartEndDateFields;
