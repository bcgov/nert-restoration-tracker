import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import IntegerSingleField from 'components/fields/IntegerSingleField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { focus, focusOptions, getFocusCodeFromLabel } from 'constants/misc';
import { useFormikContext } from 'formik';

import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectFocusForm {
  focus: {
    focuses: IMultiAutocompleteFieldOption[] | number[];
    people_involved: number | null;
  };
}

export const ProjectFocusFormInitialValues: IProjectFocusForm = {
  focus: {
    focuses: [],
    people_involved: null
  }
};

export const ProjectFocusFormYupSchema = yup.object().shape({
  focus: yup.object().shape({
    focuses: yup.array().min(1, 'You must select at least one option').required('Required'),
    people_involved: yup
      .number()
      .nullable()
      .isNumberOfPeopleInvolvedRequired(
        'People Involved is required when Healing the People is selected'
      )
  })
});

/**
 * Create project - General information section
 *
 * @return {*}
 */

const ProjectFocusForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectFocusForm>();
  const { values } = formikProps;

  return (
    <Box mt={2}>
      <Typography component="legend">Healing the Land and/or People</Typography>
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id="focus.focuses"
            data-testid="focus"
            label="Project Focus"
            options={focusOptions}
            required={true}
          />
        </Grid>
        <Grid item xs={12}>
          <IntegerSingleField
            name="focus.people_involved"
            label="Number of People Involved"
            required={
              values.focus &&
              values.focus.focuses.some((values) => {
                return values == getFocusCodeFromLabel(focus.HEALING_THE_PEOPLE);
              })
                ? true
                : false
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectFocusForm;
