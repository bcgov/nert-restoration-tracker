import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectPartnershipsFormArrayItem {
  partnership: string;
}
export interface IProjectPartnershipsForm {
  partnership: {
    partnerships: IProjectPartnershipsFormArrayItem[];
  };
}

export const ProjectPartnershipsFormInitialValues: IProjectPartnershipsForm = {
  partnership: {
    partnerships: []
  }
};

export const ProjectPartnershipsFormYupSchema = yup.object().shape({
  partnership: yup.object().shape({
    partnerships: yup.array().nullable()
  })
});

/**
 * Create project - Partnerships section
 *
 * @return {*}
 */
const ProjectPartnershipsForm: React.FC = () => {
  return (
    <>
      <Typography component="legend">Partnerships</Typography>

      <Box mb={3} maxWidth={'72ch'}>
        <Typography variant="body1" color="textSecondary">
          Specify any additional partnerships that have not been previously identified as a funding
          sources.
        </Typography>
      </Box>

      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <CustomTextField name={'partnership.partnerships'} label={'Partnership'} />
        </Grid>
      </Grid>

      <Box pt={2}>
        <Button
          type="button"
          variant="outlined"
          color="primary"
          aria-label="add authorization"
          startIcon={<Icon path={mdiPlus} size={1}></Icon>}
          // onClick={() => arrayHelpers.push(ProjectPartnershipsFormInitialValues)}
        >
          Add New Partnership
        </Button>
      </Box>
    </>
  );
};

export default ProjectPartnershipsForm;
