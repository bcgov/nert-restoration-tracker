import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectGeneralInformationForm {
  project_name: string;
  start_date: string;
  end_date: string;
  objectives: string;
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project_name: '',
  start_date: '',
  end_date: '',
  objectives: ''
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
  start_date: yup.string().isValidDateString().required('Required'),
  end_date: yup.string().isValidDateString().isEndDateAfterStartDate('start_date'),
  objectives: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .required('You must provide objectives for the project')
});
/**
 * Create project - General information section
 *
 * @return {*}
 */
const ProjectGeneralInformationForm: React.FC = (props) => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={9}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField fullWidth required variant="outlined" label="Project Name" id="project_name"></TextField>
          </Grid>
          <StartEndDateFields formikProps={formikProps} startRequired={true} endRequired={false} />
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              variant="outlined"
              label="Objectives"
              id="objectives"
              multiline={true}
              rows={4}></TextField>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectGeneralInformationForm;
