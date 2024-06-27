import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CustomTextField from 'components/fields/CustomTextField';
import DollarAmountField from 'components/fields/DollarAmountField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import { IInvestmentActionCategoryOption } from './ProjectFundingForm';
import StartEndDateFields from 'components/fields/PlanStartEndDateFields';
import IsPublic from 'components/fields/IsPublic';

export interface IProjectFundingFormArrayItem {
  agency_id: number;
  investment_action_category: number;
  description: string;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  is_public: string;
}

export const ProjectFundingFormArrayItemInitialValues: IProjectFundingFormArrayItem = {
  agency_id: '' as unknown as number,
  investment_action_category: '' as unknown as number,
  description: '',
  agency_project_id: '',
  funding_amount: '' as unknown as number,
  start_date: '',
  end_date: '',
  is_public: 'false'
};

export const ProjectFundingFormArrayItemYupSchema = yup.object().shape({
  agency_id: yup
    .number()
    .transform((value) => (isNaN(value) && null) || value)
    .required('Required'),
  investment_action_category: yup.number().required('Required'),
  description: yup.string().max(255, 'Cannot exceed 255 characters').nullable().notRequired(),
  agency_project_id: yup.string().max(50, 'Cannot exceed 50 characters').nullable().notRequired(),
  funding_amount: yup
    .number()
    .transform((value) => (isNaN(value) && null) || value)
    .typeError('Must be a number')
    .min(0, 'Must be a positive number')
    .max(9999999999, 'Must be less than $9,999,999,999')
    .required('Required'),
  start_date: yup.string().isValidDateString().required('Required'),
  end_date: yup
    .string()
    .isValidDateString()
    .required('Required')
    .isEndDateAfterStartDate('start_date'),
  is_public: yup.string().required('Required')
});

export interface IProjectFundingItemFormProps {
  fundingSources: IMultiAutocompleteFieldOption[];
  investment_action_category: IInvestmentActionCategoryOption[];
}

/**
 * A modal form for a single item of the project funding sources array.
 *
 * @See ProjectFundingForm.tsx
 *
 * @param {*} props
 * @return {*}
 */

const ProjectFundingItemForm: React.FC<IProjectFundingItemFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectFundingFormArrayItem>();

  const { values, touched, errors, handleChange, handleSubmit, setFieldValue } = formikProps;

  // Only show investment_action_category if certain agency_id values are selected
  // Toggle investment_action_category label and dropdown values based on chosen agency_id
  const investment_action_category_label =
    (values.agency_id === 1 && 'Investment Action') ||
    (values.agency_id === 2 && 'Investment Category') ||
    null;

  return (
    <form data-testid="funding-item-form" onSubmit={handleSubmit}>
      <Box component="fieldset" mt={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
              <InputLabel id="agency_id-label">Funding Organization Name</InputLabel>
              <Select
                id="agency_id"
                name="agency_id"
                labelId="agency_id-label"
                label="Funding Organization Name"
                value={values.agency_id}
                onChange={(event) => {
                  handleChange(event);
                  // investment_action_category is dependent on agency_id, so reset it if agency_id changes
                  setFieldValue(
                    'investment_action_category',
                    ProjectFundingFormArrayItemInitialValues.investment_action_category
                  );

                  // If an agency_id with a `Not Applicable` investment_action_category is chosen, auto select
                  // it for the user.
                  if (event.target.value !== 1 && event.target.value !== 2) {
                    setFieldValue(
                      'investment_action_category',
                      props.investment_action_category.find(
                        (item) => item.fs_id === event.target.value
                      )?.value || 0
                    );
                  }
                }}
                error={touched.agency_id && Boolean(errors.agency_id)}
                inputProps={{
                  'aria-label': 'Funding Organization Name',
                  'data-testid': 'agency-id'
                }}>
                {props.fundingSources.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.agency_id}</FormHelperText>
            </FormControl>
          </Grid>
          {investment_action_category_label && (
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                <InputLabel id="investment_action_category-label">
                  {investment_action_category_label}
                </InputLabel>
                <Select
                  id="investment_action_category"
                  name="investment_action_category"
                  labelId="investment_action_category-label"
                  label={investment_action_category_label}
                  value={values.investment_action_category}
                  onChange={handleChange}
                  error={
                    touched.investment_action_category && Boolean(errors.investment_action_category)
                  }
                  inputProps={{
                    'aria-label': `${investment_action_category_label}`,
                    'data-testid': 'investment_action_category'
                  }}>
                  {props.investment_action_category
                    // Only show the investment action categories whose fs_id matches the agency_id id
                    .filter((item) => item.fs_id === values.agency_id)
                    .map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{errors.investment_action_category}</FormHelperText>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12}>
            <CustomTextField name="description" label="Description" />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField name="agency_project_id" label="Agency Project ID" />
          </Grid>
          <Grid item xs={12}>
            <DollarAmountField
              required={true}
              id="funding_amount"
              name="funding_amount"
              label="Funding Amount"
            />
          </Grid>
          <Grid item xs={12}>
            <StartEndDateFields
              formikProps={formikProps}
              startName={'start_date'}
              endName={'end_date'}
              startRequired={true}
              endRequired={true}
            />
          </Grid>
          <Grid item xs={12}>
            <IsPublic
              touched={touched.is_public}
              errors={errors.is_public}
              values={values.is_public}
              handleChange={(value: string) => setFieldValue('is_public', value)}
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
