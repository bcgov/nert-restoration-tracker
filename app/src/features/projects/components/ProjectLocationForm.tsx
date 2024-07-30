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
import * as turf from '@turf/turf';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import MapContainer from 'components/map/MapContainer';
import MapFeatureList from 'components/map/components/MapFeatureList';
import GeoJSONDescription from 'components/map/components/UploadInstructions';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
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
      .required('You must specify a project boundary')
      .test('siteName-not-blank', 'Site names cannot be blank', (value) => {
        const returnValue = value.every((feature: Feature) => {
          if (feature.properties?.siteName) {
            return true;
          } else {
            return false;
          }
        });
        return returnValue;
    }),
    is_within_overlapping: yup.string().notRequired(),
    size_ha: yup.number().nullable(),
    number_sites: yup.number().min(1, 'At least one site is required').required('Required'),
    conservationAreas: yup
      .array()
      .of(
        yup.object().shape({
          conservationArea: yup.string().max(100, 'Cannot exceed 100 characters.').nullable()
        })
      )
      .isUniqueConservationArea('Conservation area entries must be unique.')
      .isConservationAreasRequired(
        'is_within_overlapping',
        'At least one conservation areas is required when project is within or overlapping a known area of cultural or conservation.'
      )
  })
});

/**
 * Calculate the total area of an array of features.
 * Represented in Hectares with 2 decimal places.
 * Overlapping areas are merged into one.
 * @param features
 * @returns Hectares with 2 decimal places
 */
const calculateTotalArea = (features: any) => {
  // This is working event though the docs say it should be a FeatureCollection.
  const merged = features.reduce((acc: any, feature: any) => {
    return turf.union(acc, feature);
  }, features[0]);

  return Math.round(turf.area(merged) / 100) / 100;
};

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

  const { errors, touched, values, handleChange, setFieldValue } = formikProps;

  // console.log('values', values);

  const [openUploadBoundary, setOpenUploadBoundary] = useState(false);

  const [maskState, setMaskState] = useState<boolean[]>(
    values.location.geometry.map((feature) => feature?.properties?.maskedLocation) || []
  );

  /**
   * Listen for a change in the number of sites and update the form
   */
  useEffect(() => {
    if (values.location.number_sites !== values.location.geometry.length) {
      setFieldValue('location.number_sites', values.location.geometry.length);
    }

    const totalArea =
      values.location.geometry.length > 0 ? calculateTotalArea(values.location.geometry) : 0;

    if (values.location.size_ha !== totalArea) {
      setFieldValue('location.size_ha', totalArea);
    }
  }, [values.location.geometry.length]);

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
      </Box>
      <Box component="fieldset">
        <Typography component="legend">Project Areas *</Typography>
        <Box mb={3} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Upload a GeoJSON file to define your project boundary.
            <Tooltip title="GeoJSON Properties Information" placement="right">
              <IconButton onClick={openGeoJSONDescription}>
                <InfoIcon color="info" />
              </IconButton>
            </Tooltip>
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
            autoFocus={true}
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
