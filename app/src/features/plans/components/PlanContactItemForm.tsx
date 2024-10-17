import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IPlanContactItemForm {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  organization: string;
  is_public: string;
  is_primary: string;
  is_first_nation: boolean;
}

export const PlanContactItemInitialValues: IPlanContactItemForm = {
  first_name: '',
  last_name: '',
  email_address: '',
  phone_number: '',
  organization: '',
  is_public: 'true',
  is_primary: 'false',
  is_first_nation: false
};

export const PlanContactItemYupSchema = yup.object().shape({
  first_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  last_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  email_address: yup
    .string()
    .max(300, 'Cannot exceed 300 characters')
    .email('Must be a valid email address')
    .required('Required'),
  organization: yup
    .string()
    .max(100, 'Cannot exceed 100 characters')
    .required('Required')
    .nullable(),
  is_public: yup.string().required('Required'),
  is_primary: yup.string().required('Required')
});

/*
 * A modal form for a single Plan contact.
 *
 * @See PlanContactForm.tsx
 *
 * @return {*}
 */
const PlanContactItemForm: React.FC = () => {
  const { values, touched, errors, handleChange, setFieldValue } =
    useFormikContext<IPlanContactItemForm>();

  return (
    <form data-testid="contact-item-form" aria-labelledby="contact-item-form-title">
      <Box component="fieldset">
        <Typography id="contact-item-form-title" component="legend">
          Contact Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="first_name"
              label="First Name"
              other={{
                required: true
              }}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="last_name"
              label="Last Name"
              other={{
                required: true
              }}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="email_address"
              label="Business Email Address"
              other={{
                required: true
              }}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField name="phone_number" label="Phone Number" />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="organization"
              label="Organization"
              other={{
                required: true
              }}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  id="isFirstNation"
                  name="is_first_nation"
                  aria-label="First Nation or Indigenous Governing Body"
                  checked={values.is_first_nation}
                  value={values.is_first_nation}
                  onChange={(value) => {
                    if (value) {
                      setFieldValue('is_public', 'true');
                    } else {
                      setFieldValue('is_public', 'false');
                    }
                    handleChange(value);
                  }}
                />
              }
              label={
                <Typography color="textSecondary">
                  First Nation or Indigenous Governing Body
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  id="primary_contact_details"
                  name="is_primary"
                  aria-label="Primary Contact Details"
                  checked={JSON.parse(values.is_primary)}
                  value={String(!values.is_primary)}
                  onChange={handleChange}
                />
              }
              label={
                <Typography color="textSecondary">
                  This person is the primary contact for this Plan
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </Box>
      {values.is_first_nation && (
        <Box mt={4}>
          <FormControl
            required={true}
            component="fieldset"
            error={touched.is_public && Boolean(errors.is_public)}>
            <Typography color="textSecondary">
              If you are a First Nation or an Indigenous Governing Body, you can hide the contact
              details information from the public. Do you wish to hide these details from the
              public?
            </Typography>
            <Box mt={2} pl={1}>
              <RadioGroup
                name="is_public"
                aria-label="Share Contact Details"
                value={values.is_public}
                onChange={handleChange}>
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
                <FormHelperText>{errors.is_public}</FormHelperText>
              </RadioGroup>
            </Box>
          </FormControl>
        </Box>
      )}

      <Box mt={4}>
        <Divider />
      </Box>
    </form>
  );
};

export default PlanContactItemForm;
