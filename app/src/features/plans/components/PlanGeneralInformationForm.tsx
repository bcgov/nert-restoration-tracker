import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import PlanStartEndDateFields from 'components/fields/PlanStartEndDateFields';
import { getStateCodeFromLabel, getStatusStyle, states } from 'components/workflow/StateMachine';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IPlanGeneralInformationForm {
  project: {
    is_project: boolean;
    project_name: string;
    state_code: number;
    brief_desc: string;
    start_date: string;
    end_date: string;
    is_healing_land: boolean;
    is_healing_people: boolean;
    is_land_initiative: boolean;
    is_cultural_initiative: boolean;
  };
}

export const PlanGeneralInformationFormInitialValues: IPlanGeneralInformationForm = {
  project: {
    is_project: false,
    project_name: '',
    state_code: getStateCodeFromLabel(states.DRAFT),
    brief_desc: '',
    start_date: '',
    end_date: '',
    is_healing_land: false,
    is_healing_people: false,
    is_land_initiative: false,
    is_cultural_initiative: false
  }
};

export const PlanGeneralInformationFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
    start_date: yup.string().nullable().isValidDateString(),
    end_date: yup.string().nullable().isValidDateString().isEndDateAfterStartDate('start_date'),
    brief_desc: yup
      .string()
      .max(500, 'Cannot exceed 500 characters')
      .required('You must provide a brief description for the plan')
  })
});

/**
 * Create plan - General information section
 *
 * @return {*}
 */

const PlanGeneralInformationForm: React.FC = () => {
  const formikProps = useFormikContext<IPlanGeneralInformationForm>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
            <CustomTextField
              name="project.project_name"
              label="Plan Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="project.no_data"
              label="Plan Status"
              other={{
                InputProps: {
                  readOnly: true,
                  startAdornment: (
                    <Chip
                      size="small"
                      sx={getStatusStyle(getStateCodeFromLabel(states.DRAFT))}
                      label={states.DRAFT}
                    />
                  )
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid item xs={12}>
              <CustomTextField
                name="project.brief_desc"
                label="Brief Description"
                other={{ required: true, multiline: true, maxRows: 5 }}
                maxLength={500}
              />
            </Grid>
          </Grid>
          <PlanStartEndDateFields
            formikProps={formikProps}
            startName={'project.start_date'}
            endName={'project.end_date'}
            startRequired={true}
            endRequired={true}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PlanGeneralInformationForm;
