import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import DollarAmountField from 'components/fields/DollarAmountField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import StartEndDateFields from 'components/fields/PlanStartEndDateFields';
import IsPublic from 'components/fields/IsPublic';
import { CreateProjectI18N } from 'constants/i18n';

export interface IProjectFundingFormArrayItem {
  organization_name: string;
  description: string;
  funding_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  is_public: string;
}

export const ProjectFundingFormArrayItemInitialValues: IProjectFundingFormArrayItem = {
  organization_name: '' as unknown as string,
  description: '',
  funding_project_id: '',
  funding_amount: '' as unknown as number,
  start_date: '',
  end_date: '',
  is_public: 'false'
};

export const ProjectFundingFormArrayItemYupSchema = yup.object().shape({
  organization_name: yup.string().max(200, 'Cannot exceed 200 characters').required(),
  description: yup.string().max(255, 'Cannot exceed 255 characters').nullable().notRequired(),
  funding_project_id: yup.string().max(50, 'Cannot exceed 50 characters').nullable().notRequired(),
  funding_amount: yup
    .number()
    .transform((value) => (isNaN(value) && null) || value)
    .typeError('Must be a number')
    .min(0, 'Must be a positive number')
    .max(9999999999, 'Must be less than $9,999,999,999')
    .required('Required'),
  start_date: yup.string().isValidDateString().nullable(),
  end_date: yup.string().isValidDateString().isEndDateAfterStartDate('start_date').nullable(),
  is_public: yup.string().required('Required')
});

/**
 * A modal form for a single item of the project funding sources array.
 *
 * @See ProjectFundingForm.tsx
 *
 * @return {*}
 */

const ProjectFundingItemForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectFundingFormArrayItem>();

  const { values, touched, errors, handleSubmit, setFieldValue } = formikProps;

  return (
    <form data-testid="funding-item-form" onSubmit={handleSubmit}>
      <Box component="fieldset" mt={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
              <CustomTextField
                name="organization_name"
                label="Funding Organization Name"
                other={{
                  required: true
                }}
              />
              <FormHelperText>{errors.organization_name}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField name="description" label="Description" />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField name="funding_project_id" label="Funding Project ID" />
          </Grid>
          <Grid item xs={12}>
            <DollarAmountField
              required={true}
              id="funding_amount"
              name="funding_amount"
              label={CreateProjectI18N.fundingAmount}
            />
          </Grid>
          <Grid item xs={12}>
            <StartEndDateFields
              formikProps={formikProps}
              startName={'start_date'}
              endName={'end_date'}
              startRequired={false}
              endRequired={false}
            />
          </Grid>
          <Grid item xs={12}>
            <IsPublic
              touched={touched.is_public}
              errors={errors.is_public}
              values={values.is_public}
              handleChange={(value: string) => setFieldValue('is_public', value)}
              customizeFor={'Funding'}
            />
          </Grid>
        </Grid>
      </Box>
      <Box mt={4}>
        <Divider />
      </Box>
    </form>
  );
};

export default ProjectFundingItemForm;
