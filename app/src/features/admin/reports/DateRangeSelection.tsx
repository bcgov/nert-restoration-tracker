import Box from '@mui/material/Box';
import RadioGroup, { useRadioGroup } from '@mui/material/RadioGroup';
import FormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';
import React from 'react';
import { FormControl, FormLabel, Radio } from '@mui/material';
import ReportsStartEndDateFields from 'components/fields/ReportsStartEndDateFields';

interface IDateRangeSelectionProps {
  selectedRange: string;
  setSelectedRange: (event: any) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}
interface StyledFormControlLabelProps extends FormControlLabelProps {
  checked: boolean;
}

const StyledFormControlLabel = styled((props: StyledFormControlLabelProps) => (
  <FormControlLabel {...props} />
))(({ theme, checked }) => ({
  '.MuiFormControlLabel-label': checked && {
    color: theme.palette.primary.main,
    fontWeight: 600
  }
}));

function DateRangeFormControlLabel(props: FormControlLabelProps) {
  const radioGroup = useRadioGroup();

  let checked = false;

  if (radioGroup) {
    checked = radioGroup.value === props.value;
  }

  return <StyledFormControlLabel sx={{ margin: '10px' }} checked={checked} {...props} />;
}

/**
 * Select report date range.
 *
 * @param {*} props
 * @return {*}
 */
const DateRangeSelection: React.FC<IDateRangeSelectionProps> = (props) => {
  const { selectedRange, setSelectedRange, startDate, setStartDate, endDate, setEndDate } = props;

  const handleChange = (event: any) => {
    setSelectedRange(event.target.value);
  };

  return (
    <FormControl>
      <FormLabel sx={{ px: 2, pt: 2, fontWeight: 700 }} id="reports-radio-buttons-group-label">
        Date Range
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby="reports-radio-buttons-group-label"
        name="reports-radio-buttons-group"
        value={selectedRange}
        onChange={handleChange}>
        <DateRangeFormControlLabel value="currentMonth" control={<Radio />} label="Current Month" />
        <DateRangeFormControlLabel value="lastMonth" control={<Radio />} label="Last Month" />
        <DateRangeFormControlLabel value="customRange" control={<Radio />} label="Custom Range" />
      </RadioGroup>
      {'customRange' === selectedRange && (
        <Box m={2} pl={2}>
          <ReportsStartEndDateFields
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </Box>
      )}
    </FormControl>
  );
};

export default DateRangeSelection;
