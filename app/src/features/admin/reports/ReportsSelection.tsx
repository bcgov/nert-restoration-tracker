import RadioGroup, { useRadioGroup } from '@mui/material/RadioGroup';
import FormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';
import React from 'react';
import { FormControl, FormLabel, Radio } from '@mui/material';

interface IReportSelectionProps {
  selectedReport: string;
  setSelectedReport: (event: any) => void;
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

function ReportsControlLabel(props: FormControlLabelProps) {
  const radioGroup = useRadioGroup();

  let checked = false;

  if (radioGroup) {
    checked = radioGroup.value === props.value;
  }

  return <StyledFormControlLabel sx={{ margin: '10px' }} checked={checked} {...props} />;
}

/**
 * Select report type to generate.
 *
 * @param {*} props
 * @return {*}
 */
const ReportsSelection: React.FC<IReportSelectionProps> = (props) => {
  const { selectedReport, setSelectedReport } = props;

  const handleChange = (event: any) => {
    setSelectedReport(event.target.value);
  };

  return (
    <FormControl>
      <FormLabel sx={{ px: 2, pt: 2, fontWeight: 700 }} id="report-type-radio-group-label">
        Select Report
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby="report-type-radio-buttons-group-label"
        name="report-type-radio-buttons-group"
        value={selectedReport}
        onChange={handleChange}>
        <ReportsControlLabel value="appUserReport" control={<Radio />} label="Users Report" />
        <ReportsControlLabel value="customReport" control={<Radio />} label="Custom Report" />
        <ReportsControlLabel value="piReport" control={<Radio />} label="PI Mgmt. Report" />
      </RadioGroup>
    </FormControl>
  );
};

export default ReportsSelection;
