import { mdiCalendarEnd, mdiCalendarStart } from '@mdi/js';
import Icon from '@mdi/react';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateValidationError } from '@mui/x-date-pickers/models';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import React, { useMemo } from 'react';

interface IReportsStartEndDateFieldsProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
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
  const [error, setError] = React.useState<DateValidationError | null>(null);
  const { startDate, setStartDate, endDate, setEndDate } = props;

  const errorMessage = useMemo(() => {
    switch (error) {
      case 'invalidDate': {
        return 'Entered date is not valid';
      }
      default: {
        return '';
      }
    }
  }, [error]);

  const formattedStartDateValue =
    (startDate &&
      dayjs(startDate, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(startDate, DATE_FORMAT.ShortDateFormat)) ||
    null;

  const formattedEndDateValue =
    (endDate &&
      dayjs(endDate, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(endDate, DATE_FORMAT.ShortDateFormat)) ||
    null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container item spacing={1.5}>
        <Grid item xs={6}>
          <DatePicker
            onError={(newError) => setError(newError)}
            slots={{
              openPickerIcon: CalendarStartIcon
            }}
            slotProps={{
              textField: {
                size: 'small',
                id: 'start_date',
                required: true,
                variant: 'outlined',
                error: !!error,
                helperText: errorMessage,
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
            minDate={dayjs('2024-09-01')}
            maxDate={dayjs()}
            value={formattedStartDateValue}
            onChange={(value) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setStartDate('');
                return;
              }

              setStartDate(dayjs(value).format(DATE_FORMAT.ShortDateFormat));
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
                required: true,
                variant: 'outlined',
                error: !!error,
                helperText: errorMessage,
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
            minDate={dayjs(startDate)}
            maxDate={dayjs()}
            value={formattedEndDateValue}
            onChange={(value: dayjs.Dayjs | null) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setEndDate('');
                return;
              }

              setEndDate(dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default ReportsStartEndDateFields;
