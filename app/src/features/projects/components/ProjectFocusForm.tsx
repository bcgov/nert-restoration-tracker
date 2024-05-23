import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
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
    focuses: IMultiAutocompleteFieldOption[];
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
    // people_involved: yup.number().positive().integer().nullable().required(`Required when selecting "${focus.HEALING_THE_PEOPLE}"`)
    people_involved: yup.number().positive().integer().nullable()
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
    <>
      <Typography component="legend">Healing the Land and/or People</Typography>
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} md={9}>
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
              <Grid item xs={12}>
                <IntegerSingleField
                  name="focus.people_involved"
                  label="Number of People Involved"
                  required={
                    values.focus.focuses &&
                    values.focus.focuses.some((values) => {
                      // @ts-ignore
                      return values == getFocusCodeFromLabel(focus.HEALING_THE_PEOPLE);
                    })
                      ? true
                      : false
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectFocusForm;
