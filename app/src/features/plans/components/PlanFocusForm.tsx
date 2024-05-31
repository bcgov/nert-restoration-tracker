import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { focusOptions } from 'constants/misc';

import React from 'react';
import yup from 'utils/YupSchema';

export interface IPlanFocusForm {
  focus: {
    focuses: IMultiAutocompleteFieldOption[];
  };
}

export const PlanFocusFormInitialValues: IPlanFocusForm = {
  focus: {
    focuses: []
  }
};

export const PlanFocusFormYupSchema = yup.object().shape({
  focus: yup.object().shape({
    focuses: yup.array().min(1, 'You must select at least one option').required('Required')
  })
});

/**
 * Create project - General information section
 *
 * @return {*}
 */

const PlanFocusForm: React.FC = () => {
  return (
    <>
      <Typography component="legend">Healing the Land and/or People</Typography>
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} md={12}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <MultiAutocompleteFieldVariableSize
                id="focus.focuses"
                data-testid="focus"
                label="Plan Focus"
                options={focusOptions}
                required={true}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default PlanFocusForm;
