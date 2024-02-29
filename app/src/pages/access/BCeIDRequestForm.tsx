import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import { IBCeIDAccessRequestDataObject } from 'interfaces/useAdminApi.interface';
import React from 'react';
import yup from 'utils/YupSchema';

export const BCeIDRequestFormInitialValues: IBCeIDAccessRequestDataObject = {
  company: '',
  reason: ''
};

export const BCeIDRequestFormYupSchema = yup.object().shape({
  company: yup.string().required('Required'),
  reason: yup.string().max(300, 'Maximum 300 characters')
});

/**
 * Access Request - BCeID request fields
 *
 * @return {*}
 */
const BCeIDRequestForm = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h3>Company Name</h3>
          <CustomTextField
            name="company"
            label="Company Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <h3>Why are you requesting access to Northeast Restoration Tracker?</h3>
          <CustomTextField name="reason" label="Request Reason" other={{ multiline: true, rows: 4 }} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BCeIDRequestForm;
