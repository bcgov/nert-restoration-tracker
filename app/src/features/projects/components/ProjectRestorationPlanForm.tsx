import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectRestorationPlanForm {
  restoration_plan: {
    is_project_part_public_plan: boolean;
  };
}

export const ProjectRestorationPlanFormInitialValues: IProjectRestorationPlanForm = {
  restoration_plan: {
    is_project_part_public_plan: false
  }
};

export const ProjectRestorationPlanFormYupSchema = yup.object().shape({
  restoration_plan: yup.object().shape({
    is_project_part_public_plan: yup.boolean().required('Required')
  })
});

/**
 * Create project - Restoration Plan section
 *
 * @return {*}
 */

const ProjectRestorationPlanForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectRestorationPlanForm>();
  const { errors, touched, values, handleChange } = formikProps;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={9}>
        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
            <FormControl
              component="fieldset"
              error={
                touched.restoration_plan?.is_project_part_public_plan &&
                Boolean(errors.restoration_plan?.is_project_part_public_plan)
              }
            >
              <FormLabel component="legend">
                Is this project part of a publicly available restoration plan? *
              </FormLabel>
              <RadioGroup
                name="restoration_plan.is_project_part_public_plan"
                aria-label="is this project part of a publicly available restoration plan"
                value={values.restoration_plan.is_project_part_public_plan || false}
                onChange={handleChange}
              >
                <FormControlLabel
                  value={false}
                  control={<Radio color="primary" size="small" />}
                  label="No"
                />
                <FormControlLabel
                  value={true}
                  control={<Radio color="primary" size="small" />}
                  label="Yes"
                />
                <FormHelperText>
                  {touched.restoration_plan?.is_project_part_public_plan &&
                    errors.restoration_plan?.is_project_part_public_plan}
                </FormHelperText>
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectRestorationPlanForm;
