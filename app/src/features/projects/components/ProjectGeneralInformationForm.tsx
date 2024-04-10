import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import ProjectStartEndDateFields from 'components/fields/ProjectStartEndDateFields';
import { useFormikContext } from 'formik';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { debounce } from 'lodash-es';
import React, { useCallback } from 'react';
import yup from 'utils/YupSchema';

export interface IProjectGeneralInformationForm {
  project: {
    project_name: string;
    is_project: boolean;
    state_code: number;
    start_date: string;
    end_date: string;
    actual_start_date: string;
    actual_end_date: string;
    objectives: string;
  };
  species: {
    focal_species: number[];
  };
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project: {
    project_name: '',
    is_project: true,
    state_code: 0,
    start_date: '',
    end_date: '',
    actual_start_date: '',
    actual_end_date: '',
    objectives: ''
  },
  species: {
    focal_species: []
  }
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
    start_date: yup.string().isValidDateString().required('Required'),
    end_date: yup.string().nullable().isValidDateString().isEndDateAfterStartDate('start_date'),
    objectives: yup
      .string()
      .max(3000, 'Cannot exceed 3000 characters')
      .required('You must provide objectives for the project')
  })
  // This part of the form is not yet implemented
  // species: yup.object().shape({
  //   focal_species: yup.array().min(1, 'You must specify a focal species').required('Required')
  // })
});

/**
 * Create project - General information section
 *
 * @return {*}
 */

const ProjectGeneralInformationForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  const restorationTrackerApi = useRestorationTrackerApi();

  const convertOptions = (value: any): IMultiAutocompleteFieldOption[] =>
    value.map((item: any) => {
      return { value: parseInt(item.id), label: item.label };
    });

  const handleGetInitList = async (initialvalues: number[]) => {
    const response = await restorationTrackerApi.taxonomy.getSpeciesFromIds(initialvalues);
    return convertOptions(response.searchResponse);
  };

  const handleSearch = useCallback(
    debounce(
      async (
        inputValue: string,
        existingValues: (string | number)[],
        callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
      ) => {
        const response = await restorationTrackerApi.taxonomy.searchSpecies(inputValue);
        const newOptions = convertOptions(response.searchResponse).filter(
          (item) => !existingValues.includes(item.value)
        );
        callback(newOptions);
      },
      500
    ),
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={9}>
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
          <Grid item xs={12}>
            <Grid item xs={12}>
              <CustomTextField
                name="project.objectives"
                label="Objectives"
                other={{ required: true, multiline: true, rowsmax: 24 }}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid item xs={12}>
              <MultiAutocompleteFieldVariableSize
                id="species.focal_species"
                label="Focal Species"
                required={false}
                type="api-search"
                getInitList={handleGetInitList}
                search={handleSearch}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectGeneralInformationForm;
