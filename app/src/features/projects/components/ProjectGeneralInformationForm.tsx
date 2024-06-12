import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import ProjectStartEndDateFields from 'components/fields/ProjectStartEndDateFields';
import { getStateCodeFromLabel, getStatusStyle, states } from 'components/workflow/StateMachine';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import './styles/projectImage.css';
import ThumbnailImageField from 'components/fields/ThumbnailImageField';

export interface IProjectGeneralInformationForm {
  project: {
    project_name: string;
    is_project: boolean;
    state_code: number;
    brief_desc: string;
    start_date: string;
    end_date: string;
    actual_start_date: string;
    actual_end_date: string;
    is_healing_land: boolean;
    is_healing_people: boolean;
    is_land_initiative: boolean;
    is_cultural_initiative: boolean;
    people_involved: number | null;
    project_image?: File | null;
    image_url?: string;
    image_key?: string;
  };
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project: {
    project_name: '',
    is_project: true,
    state_code: getStateCodeFromLabel(states.DRAFT),
    brief_desc: '',
    start_date: '',
    end_date: '',
    actual_start_date: '',
    actual_end_date: '',
    is_healing_land: false,
    is_healing_people: false,
    is_land_initiative: false,
    is_cultural_initiative: false,
    people_involved: null,
    project_image: null,
    image_url: '',
    image_key: ''
  }
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
    start_date: yup.string().nullable().isValidDateString(),
    end_date: yup.string().nullable().isValidDateString().isEndDateAfterStartDate('start_date'),
    brief_desc: yup
      .string()
      .max(500, 'Cannot exceed 500 characters')
      .required('You must provide a brief description for the project')
  })
});

/**
 * Create project - General information section
 *
 * @return {*}
 */
const ProjectGeneralInformationForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  return (
    <Grid container spacing={3}>
      <ThumbnailImageField />
      <Grid item xs={12} md={8}>
        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
            <CustomTextField
              name="project.project_name"
              label="Project Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="project.no_data"
              label="Project Status"
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
          <ProjectStartEndDateFields
            formikProps={formikProps}
            plannedStartName={'project.start_date'}
            plannedEndName={'project.end_date'}
            plannedStartRequired={false}
            plannedEndRequired={false}
            actualStartName={'project.actual_start_date'}
            actualEndName={'project.actual_end_date'}
            actualStartRequired={false}
            actualEndRequired={false}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectGeneralInformationForm;
