import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectContactItemForm {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  organization: string;
  is_public: string;
  is_primary: string;
}

export const ProjectContactItemInitialValues: IProjectContactItemForm = {
  first_name: '',
  last_name: '',
  email_address: '',
  phone_number: '',
  organization: '',
  is_public: 'false',
  is_primary: 'false'
};

export const ProjectContactItemYupSchema = yup.object().shape({
  first_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  last_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  email_address: yup
    .string()
    .max(500, 'Cannot exceed 500 characters')
    .email('Must be a valid email address')
    .required('Required'),
  organization: yup
    .string()
    .max(300, 'Cannot exceed 300 characters')
    .required('Required')
    .nullable(),
  is_public: yup.string().required('Required'),
  is_primary: yup.string().required('Required')
});

export interface IProjectContactItemFormProps {
  organization: string[];
}

/*
 * A modal form for a single project contact.
 *
 * @See ProjectContactForm.tsx
 *
 * @return {*}
 */
const ProjectContactItemForm: React.FC<IProjectContactItemFormProps> = (props) => {
  const { values, touched, errors, handleChange } = useFormikContext<IProjectContactItemForm>();

  const [checkPublic, setCheckPublic] = React.useState(false);

  return (
    <form data-testid="contact-item-form">
      <Box component="fieldset">
        <Typography id="agency_details" component="legend">
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
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="last_name"
              label="Last Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="email_address"
              label="Business Email Address"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField name="phone_number" label="Phone Number" />
          </Grid>
          <Grid item xs={12} md={6}>
            <AutocompleteFreeSoloField
              id="organization"
              name="organization"
              label="Organization"
              options={props.organization}
              required={true}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  id="isPublicCheck"
                  name="public_check"
                  aria-label="First Nation or Indigenous Governing Body"
                  checked={checkPublic}
                  value={String(!checkPublic)}
                  onChange={() => {
                    setCheckPublic(!checkPublic);
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
                  This person is the primary contact for this Project
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </Box>
      {checkPublic && (
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
                  label="Yes"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio color="primary" size="small" />}
                  label="No"
                />
                <FormHelperText>{errors.is_public}</FormHelperText>
              </RadioGroup>
            </Box>
          </FormControl>
        </Box>
      )}
    </form>
  );
};

export default ProjectContactItemForm;
