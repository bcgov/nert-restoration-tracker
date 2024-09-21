import RadioGroup, { useRadioGroup } from '@mui/material/RadioGroup';
import FormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { FormControl, FormLabel, Radio } from '@mui/material';

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

function ReportsControlLabel(props: FormControlLabelProps) {
  const radioGroup = useRadioGroup();

  let checked = false;

  if (radioGroup) {
    checked = radioGroup.value === props.value;
  }

  return <StyledFormControlLabel sx={{ margin: '10px' }} checked={checked} {...props} />;
}

/**
 * Table to display a list of active users.
 *
 * @param {*} props
 * @return {*}
 */
const ReportsSelection: React.FC = (props) => {
  const [selectedRange, setselectedRange] = useState('appReport');

  const handleChange = (event: any) => {
    setselectedRange(event.target.value);
  };

  return (
    <FormControl>
      <FormLabel sx={{ px: 2, pt: 2, fontWeight: 700 }} id="report-type-radio-group-label">
        Report Type
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby="report-type-radio-buttons-group-label"
        name="report-type-radio-buttons-group"
        value={selectedRange}
        onChange={handleChange}>
        <ReportsControlLabel value="appReport" control={<Radio />} label="Application Report" />
        <ReportsControlLabel value="customReport" control={<Radio />} label="Custom Report" />
        <ReportsControlLabel value="piReport" control={<Radio />} label="PI Mgmt. Report" />
      </RadioGroup>
    </FormControl>
  );
};

export default ReportsSelection;
