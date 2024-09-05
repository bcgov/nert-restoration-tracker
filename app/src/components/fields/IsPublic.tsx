import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import React from 'react';

export interface IIsPublicProps {
  touched?: boolean;
  errors?: string;
  values: string;
  customizeFor: string;
  handleChange: (value: string) => void;
}

/*
 * A modal form for a single project contact or single project funding source.
 *
 * @See ProjectContactForm.tsx
 * @See ProjectFundingItemForm.tsx
 *
 * @return {*}
 */
const IsPublic: React.FC<IIsPublicProps> = (props) => {
  const { values, touched, errors, customizeFor, handleChange } = props;

  return (
    <Box mt={4}>
      <FormControl required={true} component="fieldset" error={touched && Boolean(errors)}>
        <Typography color="textSecondary">
          {'Contact' === customizeFor &&
            'If you are a First Nation or an Indigenous Governing Body, you can hide the contact details information from the public. Do you wish to hide these details from the public?'}
          {'Funding' === customizeFor &&
            'If you are a First Nation or an Indigenous Governing Body, you can hide the project funding amount from the public. Do you wish to hide this detail from the public?'}
        </Typography>
        <Box mt={2} pl={1}>
          <RadioGroup
            name="is_public"
            aria-label="Is Public"
            value={values}
            onChange={(e) => handleChange(e.currentTarget.value)}>
            <FormControlLabel
              value="true"
              control={<Radio color="primary" size="small" />}
              label="No"
            />
            <FormControlLabel
              value="false"
              control={<Radio color="primary" size="small" />}
              label="Yes"
            />
            <FormHelperText>{errors}</FormHelperText>
          </RadioGroup>
        </Box>
      </FormControl>
    </Box>
  );
};

export default IsPublic;
