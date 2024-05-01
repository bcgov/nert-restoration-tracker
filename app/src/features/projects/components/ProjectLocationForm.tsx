import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
// import MapContainer from 'components/map/MapContainer2';
import MapContainer from 'components/map/MapContainer';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useState } from 'react';
import { handleGeoJSONUpload } from 'utils/mapBoundaryUploadHelpers';
import yup from 'utils/YupSchema';

export interface IProjectLocationForm {
  location: {
    geometry: Feature[];
    priority: string;
    region: number;
    range: number;
  };
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  location: {
    geometry: [],
    range: undefined as unknown as number,
    priority: 'false',
    region: '' as unknown as number
  }
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  location: yup.object().shape({
    geometry: yup
      .array()
      .min(1, 'You must specify a project boundary')
      .required('You must specify a project boundary'),
    range: yup.string().notRequired(),
    priority: yup.string().notRequired(),
    region: yup.string().required('Required')
  })
});

export interface IProjectLocationFormProps {
  ranges: IAutocompleteFieldOption<number>[];
  regions: IAutocompleteFieldOption<number>[];
}

/**
 * Create project - Location section
 *
 * @return {*}
 */
const ProjectLocationForm: React.FC<IProjectLocationFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectLocationForm>();

  const { errors, touched, values, handleChange } = formikProps;
  // const { errors, touched, values, handleChange, setFieldValue } = formikProps;
  console.log('values', values);

  const [openUploadBoundary, setOpenUploadBoundary] = useState(false);

  const getUploadHandler = (): IUploadHandler => {
    return async (file) => {
      if (file?.type.includes('json') || file?.name.includes('.json')) {
        handleGeoJSONUpload(file, 'location.geometry', formikProps);
      }

      return Promise.resolve();
    };
  };

  /**
   * Reactive state to share between the layer picker and the map
   */
  const boundary = useState<boolean>(true);
  const wells = useState<boolean>(false);
  const projects = useState<boolean>(false);
  const plans = useState<boolean>(false);
  const wildlife = useState<boolean>(false);
  const indigenous = useState<boolean>(false);
  const baselayer = useState<string>('hybrid');

  const layerVisibility = {
    boundary,
    wells,
    projects,
    plans,
    wildlife,
    indigenous,
    baselayer
  };

  return (
    <>
      <Box mb={5}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <FormControl component="fieldset" required={true} fullWidth variant="outlined">
              <InputLabel id="nrm-region-select-label">NRM Region</InputLabel>
              <Select
                id="nrm-region-select"
                name="location.region"
                labelId="nrm-region-select-label"
                label="NRM Region"
                value={values.location.region ? values.location.region : ''}
                onChange={formikProps.handleChange}
                error={touched?.location?.region && Boolean(errors?.location?.region)}
                displayEmpty
                inputProps={{ 'aria-label': 'NRM Region' }}>
                {props.regions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors?.location?.region}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>

        <Box>
          <Box my={2} maxWidth={'72ch'}>
            <Typography variant="body1" color="textSecondary">
              Specify the caribou range associate with this project.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={6}>
              <FormControl component="fieldset" required={false} fullWidth variant="outlined">
                <InputLabel id="caribou-range-select-label">Caribou Range</InputLabel>
                <Select
                  id="caribou-range-select"
                  name="location.range"
                  labelId="caribou-range-select-label"
                  label="Caribou Range"
                  value={values.location.range ? values.location.range : ''}
                  onChange={handleChange}
                  error={touched.location?.range && Boolean(errors.location?.range)}
                  inputProps={{ 'aria-label': 'Caribou Range' }}>
                  <MenuItem key={'empty'} value={undefined}>
                    Not Applicable
                  </MenuItem>
                  {props.ranges.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.location?.range}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box mb={4}>
        <FormControl
          component="fieldset"
          required={true}
          error={touched.location?.priority && Boolean(errors.location?.priority)}>
          <FormLabel component="legend">Is this location a priority area?</FormLabel>

          <Box mt={2}>
            <RadioGroup
              name="location.priority"
              aria-label="Location Priority"
              value={values.location.priority || 'false'}
              onChange={handleChange}>
              <FormControlLabel
                value="false"
                control={<Radio required={true} color="primary" size="small" />}
                label="No"
              />
              <FormControlLabel
                value="true"
                control={<Radio required={true} color="primary" size="small" />}
                label="Yes"
              />
              <FormHelperText>
                {touched.location?.priority && errors.location?.priority}
              </FormHelperText>
            </RadioGroup>
          </Box>
        </FormControl>
      </Box>

      <Box component="fieldset">
        <Typography component="legend">Project Boundary *</Typography>
        <Box mb={3} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Upload a GeoJSON file or use the drawing tools on the map to define your project
            boundary.
          </Typography>
        </Box>

        <Box mb={5}>
          <Button
            size="large"
            variant="outlined"
            color="primary"
            component="span"
            startIcon={<Icon path={mdiTrayArrowUp} size={1}></Icon>}
            onClick={() => setOpenUploadBoundary(true)}
            data-testid="project-boundary-upload">
            Upload Boundary
          </Button>
        </Box>

        <Box height={500}>
          <MapContainer
            mapId={'project_location_map'}
            layerVisibility={layerVisibility}
            // drawControls={{
            //   features: values.location.geometry,
            //   onChange: (features) => setFieldValue('location.geometry', features)
            // }}
          />
        </Box>
        {errors?.location?.geometry && (
          <Box pt={2}>
            <Typography style={{ fontSize: '16px', color: '#f44336' }}>
              {errors?.location?.geometry}
            </Typography>
          </Box>
        )}
      </Box>

      <ComponentDialog
        open={openUploadBoundary}
        dialogTitle="Upload Project Boundary"
        onClose={() => setOpenUploadBoundary(false)}>
        <FileUpload
          uploadHandler={getUploadHandler()}
          dropZoneProps={{
            acceptedFileExtensions: {
              'application/json': ['.json', '.geojson']
            }
          }}
        />
      </ComponentDialog>
    </>
  );
};

export default ProjectLocationForm;
