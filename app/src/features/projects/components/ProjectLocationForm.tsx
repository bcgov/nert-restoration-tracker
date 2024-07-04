import { mdiTrayArrowUp } from '@mdi/js';
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import IntegerSingleField from 'components/fields/IntegerSingleField';
import MapContainer from 'components/map/MapContainer';
import MapFeatureList from 'components/map/MapFeatureList';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useState } from 'react';
import { handleGeoJSONUpload } from 'utils/mapBoundaryUploadHelpers';
import yup from 'utils/YupSchema';
import './styles/projectLocation.css';
import ProjectLocationConservationAreas, {
  IProjectLocationConservationAreasArrayItem,
  ProjectLocationConservationAreasFormArrayItemInitialValues
} from 'features/projects/components/ProjectLocationConservationAreasForm';

export interface IProjectLocationForm {
  location: {
    geometry: Feature[];
    number_sites: number;
    region: number;
    is_within_overlapping: string;
    size_ha: number;
    conservationAreas: IProjectLocationConservationAreasArrayItem[];
  };
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  location: {
    geometry: [],
    region: '' as unknown as number,
    number_sites: '' as unknown as number,
    is_within_overlapping: 'false',
    size_ha: '' as unknown as number,
    conservationAreas: [ProjectLocationConservationAreasFormArrayItemInitialValues]
  }
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  location: yup.object().shape({
    region: yup.string().required('Required'),
    geometry: yup
      .array()
      .min(1, 'You must specify a project boundary')
      .required('You must specify a project boundary'),
    is_within_overlapping: yup.string().notRequired(),
    size_ha: yup.number().nullable(),
    number_sites: yup.number().min(1, 'At least one site is required').required('Required'),
    conservationAreas: yup
      .array()
      .of(
        yup.object().shape({
          conservationArea: yup.string().max(100, 'Cannot exceed 100 characters').nullable()
        })
      )
      .isUniqueConservationArea('Conservation area entries must be unique')
      .isConservationAreasRequired(
        'is_within_overlapping',
        'Conservation areas are required when project is within or overlapping a known area of cultural or conservation'
      )
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

  const [maskState, setMaskState] = useState<boolean[]>(
    values.location.geometry.map((feature) => feature?.properties?.maskedLocation) || []
  );

  /**
   * Mask change indicator
   * This is important in mainting the order between the map and the list
   */
  const [mask, setMask] = useState<null | number>(null);

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

  /**
   * State to share with the map to indicate which
   * feature is selected or hovered over
   */
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  /**
   * State for the GeoJSON description dialog
   */
  const [geoJSONDescriptionOpen, setGeoJSONDescriptionOpen] = useState(false);

  const openGeoJSONDescription = () => {
    setGeoJSONDescriptionOpen(true);
  };

  /**
   * GeoJSON description dialog content
   */
  const GeoJSONDescription = () => {
    return (
      <Box>
        <Typography variant="body1">
          <List dense={true} sx={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
            <ListItem sx={{ display: 'list-item' }}>
              All coordinates should be in the Geographic projection (EPSG:4326).
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              At least one Polygon or MultiPolygon feature is required.
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              No more then {process.env.REACT_APP_MAX_NUMBER_OF_FEATURES || '100'} features per
              file.
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              The property <b>siteName</b> must be present, containing the site name.
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              The property <b>areaHa</b> must be present, containing the area of the site in
              Hectares.
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              Optional - Set the boolean value of <i>Masked_Location</i> to <i>true</i> if you want
              the feature to be obscured by a mask.
            </ListItem>
          </List>
        </Typography>
      </Box>
    );
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
                variant="outlined">
                <InputLabel id="nrm-region-select-label">NRM Region</InputLabel>
                <Select
                  id="nrm-region-select"
                  name="location.region"
                  labelId="nrm-region-select-label"
                  label="NRM Region"
                  value={values.location.region ?? ''}
                  onChange={handleChange}
                  error={touched?.location?.region && Boolean(errors?.location?.region)}
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
        </Box>

        <Box mb={2}>
          <FormControl
            component="fieldset"
            error={
              touched.location?.is_within_overlapping &&
              Boolean(errors.location?.is_within_overlapping)
            }>
            <FormLabel component="legend">
              Is the project within or overlapping a known area of cultural or conservation ?
            </FormLabel>

            <Box mt={1}>
              <RadioGroup
                name="location.is_within_overlapping"
                aria-label="project within or overlapping a known area of cultural or conservation"
                value={values.location.is_within_overlapping || 'false'}
                onChange={handleChange}>
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

        <Box component="fieldset" mb={4}>
          <ProjectLocationConservationAreas />
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
            Upload a GeoJSON file to define your project boundary.
          </Typography>
          <Tooltip title="GeoJSON Properties Information" placement="right">
            <IconButton onClick={openGeoJSONDescription}>
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
            data-testid="project-boundary-upload">
            Upload Areas
          </Button>
        </Box>

        <Box className="feature-box">
          <MapFeatureList
            mask={[mask, setMask]}
            maskState={[maskState, setMaskState]}
            activeFeatureState={[activeFeature, setActiveFeature]}
          />
        </Box>

        <Box height={500}>
          <MapContainer
            mapId={'project_location_map'}
            layerVisibility={layerVisibility}
            features={values.location.geometry}
            mask={mask}
            maskState={maskState}
            activeFeatureState={[activeFeature, setActiveFeature]}
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

      <ComponentDialog
        open={geoJSONDescriptionOpen}
        dialogTitle="The GeoJSON file should align with the following criteria:"
        onClose={() => setGeoJSONDescriptionOpen(false)}>
        <GeoJSONDescription />
      </ComponentDialog>
    </>
  );
};

export default ProjectLocationForm;
