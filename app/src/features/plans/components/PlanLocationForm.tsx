import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
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
import React, { useState, useEffect } from 'react';
import { handleGeoJSONUpload } from 'utils/mapBoundaryUploadHelpers';
import yup from 'utils/YupSchema';

export interface IPlanLocationForm {
  location: {
    region: number;
    size_ha: number;
    number_sites: number;
    geometry: Feature[];
  };
}

export const PlanLocationFormInitialValues: IPlanLocationForm = {
  location: {
    region: '' as unknown as number,
    size_ha: '' as unknown as number,
    number_sites: '' as unknown as number,
    geometry: [] as unknown as Feature[]
  }
};

export const PlanLocationFormYupSchema = yup.object().shape({
  location: yup.object().shape({
    region: yup.string().required('Required'),
    size_ha: yup.number().required('Required'),
    number_sites: yup.number().min(1, 'At least one site is required').required('Required'),
    geometry: yup
      .array()
      .min(1, 'You must specify a Plan boundary')
      .required('You must specify a Plan boundary')
  })
});

export interface IPlanLocationFormProps {
  regions: IAutocompleteFieldOption<number>[];
}

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

/**
 * Create Plan - Location section
 *
 * @return {*}
 */
const PlanLocationForm: React.FC<IPlanLocationFormProps> = (props) => {
  const formikProps = useFormikContext<IPlanLocationForm>();
  const { errors, touched, values, handleChange, setFieldValue } = formikProps;

  const [geoJSONDescriptionOpen, setGeoJSONDescriptionOpen] = useState(false);

  const openGeoJSONDescription = () => {
    setGeoJSONDescriptionOpen(true);
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

  // Mask change indicator
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
   * State to share with the map to indicate which
   * feature is selected or hovered over
   */
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <>
      <Box mb={5} mt={0}>
        <Box mb={2}>
          <Typography component="legend">Area and Location Details</Typography>
        </Box>
        <Box mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={8}>
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
      </Box>
      <Box component="fieldset">
        <Typography component="legend">Plan Areas *</Typography>
        <Box mb={3} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Upload a GeoJSON file to define your Plan boundary.
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
            data-testid="Plan-boundary-upload">
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
            mapId={'plan_location_map'}
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
        dialogTitle="Upload Plan Areas"
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

export default PlanLocationForm;
