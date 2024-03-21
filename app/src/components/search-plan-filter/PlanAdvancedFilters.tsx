import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AreaSizeFields from 'components/fields/AreaSizeFields';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import PlanStartEndDateFields from 'components/fields/PlanStartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import { IPlanAdvancedFilters } from './PlanFilter';

export interface IPlanAdvancedFiltersProps {
  contact_agency: string[];
  funding_agency: IMultiAutocompleteFieldOption[];
  region: IMultiAutocompleteFieldOption[];
  plan_status: IMultiAutocompleteFieldOption[];
  plan_focus: IMultiAutocompleteFieldOption[];
}

/**
 * Plan - Advanced filters
 *
 * @return {*}
 */
const PlanAdvancedFilters: React.FC<IPlanAdvancedFiltersProps> = (props) => {
  const formikProps = useFormikContext<IPlanAdvancedFilters>();
  return (
    <Box data-testid="advancedFilters">
      <Grid container spacing={0.5} justifyContent="flex-start">
        <Grid item xs={12} md={2}>
          <Typography variant="subtitle1" component="h3">
            <strong>Plan Details</strong>
          </Typography>
        </Grid>
        <Grid item xs={12} md={10}>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <CustomTextField name="plan_name" label="Name" />
            </Grid>
            <Grid item xs={6}>
              <MultiAutocompleteFieldVariableSize
                id="plan_status"
                data-testid="plan_status"
                label="Status"
                options={props.plan_status}
                required={false}
              />
            </Grid>
            <Grid item xs={6}>
              <MultiAutocompleteFieldVariableSize
                id="region"
                data-testid="region"
                label="Region"
                options={props.region}
                required={false}
              />
            </Grid>
            <Grid item xs={12}>
              <PlanStartEndDateFields
                formikProps={formikProps}
                startName={'start_date'}
                endName={'end_date'}
                startRequired={false}
                endRequired={false}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name="plan_organizations" label="Organizations" />
            </Grid>
            <Grid item xs={12}>
              <MultiAutocompleteFieldVariableSize
                id="plan_focus"
                data-testid="plan_focus"
                label="Project Focus"
                options={props.plan_focus}
                required={false}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography mb={1} variant="subtitle1" component="h3">
                Area Size in Hectares
              </Typography>
              <AreaSizeFields
                formikProps={formikProps}
                minName={'from'}
                maxName={'to'}
                minRequired={false}
                maxRequired={false}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Box my={3}>
        <Divider></Divider>
      </Box>
    </Box>
  );
};

export default PlanAdvancedFilters;
