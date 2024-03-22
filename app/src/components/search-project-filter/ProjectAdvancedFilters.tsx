import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AreaSizeFields from 'components/fields/AreaSizeFields';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import ProjectStartEndDateFields from 'components/fields/ProjectStartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import { IProjectAdvancedFilters } from './ProjectFilter';

export interface IProjectAdvancedFiltersProps {
  contact_agency: string[];
  funding_agency: IMultiAutocompleteFieldOption[];
  region: IMultiAutocompleteFieldOption[];
  project_status: IMultiAutocompleteFieldOption[];
  project_focus: IMultiAutocompleteFieldOption[];
}

/**
 * Project - Advanced filters
 *
 * @return {*}
 */
const ProjectAdvancedFilters: React.FC<IProjectAdvancedFiltersProps> = (props) => {
  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  return (
    <Box data-testid="advancedFilters">
      <Grid container spacing={0.5} justifyContent="flex-start">
        <Grid item xs={12} md={2}>
          <Typography variant="subtitle1" component="h3">
            <strong>Project Details</strong>
          </Typography>
        </Grid>
        <Grid item xs={12} md={10}>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <CustomTextField name="project_name" label="Name" />
            </Grid>
            <Grid item xs={6}>
              <MultiAutocompleteFieldVariableSize
                id="project_status"
                data-testid="project_status"
                label="Status"
                options={props.project_status}
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
              <ProjectStartEndDateFields
                formikProps={formikProps}
                startName={'start_date'}
                endName={'end_date'}
                startRequired={false}
                endRequired={false}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name="project_objectives" label="Objectives" />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name="project_organizations" label="Organizations" />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name="project_funding_organizations" label="Funding Organizations" />
            </Grid>
            <Grid item xs={12}>
              <MultiAutocompleteFieldVariableSize
                id="project_focus"
                data-testid="project_focus"
                label="Project Focus"
                options={props.project_focus}
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

      <Grid container spacing={0.5} justifyContent="flex-start">
        <Grid item xs={12} md={2}>
          <Typography variant="subtitle1" component="h3">
            <strong>Authorization</strong>
          </Typography>
        </Grid>
        <Grid item xs={12} md={10}>
          <CustomTextField name="permit_number" label="Authorization Reference" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectAdvancedFilters;
