import { mdiPlus, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import IntegerSingleField from 'components/fields/IntegerSingleField';
import MapContainer from 'components/map/MapContainer2';
// import MapContainer from 'components/map/MapContainer';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useState } from 'react';
import { handleGeoJSONUpload } from 'utils/mapBoundaryUploadHelpers';
import yup from 'utils/YupSchema';

export interface IProjectLocationForm {
  location: {
    geometry: Feature[];
    number_sites: number;
    region: number;
    is_within_overlapping: string;
    name_area_conservation_priority: string[];
    size_ha: number;
  };
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  location: {
    geometry: [],
    region: '' as unknown as number,
    number_sites: '' as unknown as number,
    is_within_overlapping: 'false',
    name_area_conservation_priority: [],
    size_ha: '' as unknown as number
  }
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  location: yup.object().shape({
    // region: yup.string().required('Required'),
    geometry: yup
      .array()
      .min(1, 'You must specify a project boundary')
      .required('You must specify a project boundary'),
    is_within_overlapping: yup.string().notRequired(),
    // name_area_conservation_priority: yup.array().nullable(),
    size_ha: yup.number().nullable(),
    number_sites: yup.number().min(1, 'At least one site is required').required('Required')
  })
});

export interface IProjectLocationFormProps {
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

  const [openUploadBoundary, setOpenUploadBoundary] = useState(false);

  const getUploadHandler = (): IUploadHandler => {
    return async (file) => {
      if (file?.name.includes('json')) {
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
  const projects = useState<boolean>(true);
  const plans = useState<boolean>(true);
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
      <Box mb={5} mt={0}>
        <Box mb={2}>
          <Typography component="legend">Area and Location Details</Typography>
        </Box>
        <Box mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <FormControl
                component="fieldset"
                size="small"
                required={true}
                fullWidth
                variant="outlined"
              >
                <InputLabel id="nrm-region-select-label">NRM Region</InputLabel>
                <Select
                  id="nrm-region-select"
                  name="location.region"
                  labelId="nrm-region-select-label"
                  label="NRM Region"
                  value={values.location.region ?? ''}
                  onChange={handleChange}
                  error={touched?.location?.region && Boolean(errors?.location?.region)}
                  inputProps={{ 'aria-label': 'NRM Region' }}
                >
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
        </Box>

        <Box mb={4}>
          <FormControl
            component="fieldset"
            error={
              touched.location?.is_within_overlapping &&
              Boolean(errors.location?.is_within_overlapping)
            }
          >
            <FormLabel component="legend">
              Is the project within or overlapping a known area of cultural or conservation ?
            </FormLabel>

            <Box mt={1}>
              <RadioGroup
                name="location.is_within_overlapping"
                aria-label="project within or overlapping a known area of cultural or conservation"
                value={values.location.is_within_overlapping || 'false'}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="false"
                  control={<Radio color="primary" size="small" />}
                  label="No"
                />
                <FormControlLabel
                  value="true"
                  control={<Radio color="primary" size="small" />}
                  label="Yes"
                />
                <FormControlLabel
                  value="dont_know"
                  control={<Radio color="primary" size="small" />}
                  label="Don't know"
                />
                <FormHelperText>
                  {touched.location?.is_within_overlapping &&
                    errors.location?.is_within_overlapping}
                </FormHelperText>
              </RadioGroup>
            </Box>
          </FormControl>
        </Box>

        <Box mb={4}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <CustomTextField
                name={'location.name_area_conservation_priority'}
                label={'Area of Cultural or Conservation Priority Name'}
                other={{
                  disabled: true
                }}
              />
            </Grid>
          </Grid>

          <Box pt={2}>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              aria-label="add area of cultural or conservation priority"
              startIcon={<Icon path={mdiPlus} size={1}></Icon>}
              // onClick={() => arrayHelpers.push(ProjectLocationFormInitialValues)}
            >
              Add New Area
            </Button>
          </Box>
        </Box>

        <Box mb={4}>
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <IntegerSingleField
                name={'location.size_ha'}
                label={'Project Size in Hectares (total area including all sites)'}
                adornment={'Ha'}
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <IntegerSingleField
                name={'location.number_sites'}
                label={'Number of Sites'}
                required={true}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box component="fieldset">
        <Typography component="legend">Project Areas *</Typography>
        <Box mb={3} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Upload a GeoJSON file or use the drawing tools on the map to define your project
            boundary.
          </Typography>
          <Tooltip title="GeoJSON Properties Information" placement="right">
            <IconButton>
              <InfoIcon color="info" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box mb={5}>
          <Button
            size="large"
            variant="outlined"
            color="primary"
            component="span"
            startIcon={<Icon path={mdiTrayArrowUp} size={1}></Icon>}
            onClick={() => setOpenUploadBoundary(true)}
            data-testid="project-boundary-upload"
          >
            Upload Areas
          </Button>
        </Box>

        <Box height={500}>
          <MapContainer
            mapId={'project_location_map'}
            layerVisibility={layerVisibility}
            features={values.location.geometry}
          />
        </Box>
        {errors?.location?.geometry && (
          <Box pt={2}>
            <Typography style={{ fontSize: '16px', color: '#f44336' }}>
              {errors?.location?.geometry as string}
            </Typography>
          </Box>
        )}
      </Box>

      <ComponentDialog
        open={openUploadBoundary}
        dialogTitle="Upload Project Areas"
        onClose={() => setOpenUploadBoundary(false)}
      >
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
