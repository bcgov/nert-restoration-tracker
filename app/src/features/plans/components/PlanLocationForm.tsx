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
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useState, useEffect } from 'react';
import { handleGeoJSONUpload } from 'utils/mapBoundaryUploadHelpers';
import yup, { locationRequired } from 'utils/YupSchema';
import { ICreatePlanRequest, IEditPlanRequest } from 'interfaces/usePlanApi.interface';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { CreatePlanI18N } from 'constants/i18n';

export interface IPlanLocationForm {
  location: {
    region: number | string | null;
    size_ha: number | null;
    number_sites: number | null;
    geometry: Feature[] | null;
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
    region: yup.string(),
    geometry: yup.array(),
    size_ha: yup.number().nullable(),
    number_sites: yup.number()
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
  const parentFormikProps = useFormikContext<ICreatePlanRequest | IEditPlanRequest>();

  const { errors, touched, values, handleChange, setFieldValue } = formikProps;

  /**
   * Reactive state to share between the layer picker and the map
   */
  const boundary = useState<boolean>(true);
  const wells = useState<boolean>(false);
  const projects = useState<boolean>(true);
  const plans = useState<boolean>(true);
  const protectedAreas = useState<boolean>(false);
  const indigenous = useState<boolean>(false);
  const baselayer = useState<string>('hybrid');

  const layerVisibility = {
    boundary,
    wells,
    projects,
    plans,
    protectedAreas,
    indigenous,
    baselayer
  };

  const [openUploadBoundary, setOpenUploadBoundary] = useState(false);

  if (!values.location || !values.location.geometry) {
    return null;
  }

  const [maskState, setMaskState] = useState<boolean[]>(
    values.location.geometry.map((feature) => feature?.properties?.maskedLocation) || []
  );

  /**
   * Listen for a change in the number of sites and update the form
   */
  useEffect(() => {
    if (!values.location.geometry) {
      return;
    }

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

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');

  const handleClickOpen = (indexContent: string) => {
    setInfoTitle(indexContent ? indexContent : '');
    setInfoOpen(true);
  };

  // This needs to be passed to the map for filtering the region boundary
  const region = props.regions.reduce((acc, region) => {
    if (region.value === values.location.region) {
      return region.label;
    }
    return acc;
  }, '');

  return (
    <>
      <InfoDialogDraggable
        isProject={false}
        open={infoOpen}
        dialogTitle={infoTitle}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={false} contentIndex={infoTitle} />
      </InfoDialogDraggable>

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
                required={locationRequired(
                  parentFormikProps.values.focus.focuses
                    ? parentFormikProps.values.focus.focuses
                    : []
                )}
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
        <Typography component="legend">
          {CreatePlanI18N.locationArea}{' '}
          {locationRequired(
            parentFormikProps.values.focus.focuses ? parentFormikProps.values.focus.focuses : []
          ) && '*'}
          <IconButton edge="end" onClick={() => handleClickOpen(CreatePlanI18N.locationArea)}>
            <InfoIcon color="info" />
          </IconButton>
        </Typography>
        <Box mb={3} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Upload a GeoJSON file to define your Plan boundary.
            <Tooltip title={CreatePlanI18N.locationGeoJSONProperties} placement="right">
              <IconButton
                edge="end"
                onClick={() => handleClickOpen(CreatePlanI18N.locationGeoJSONProperties)}>
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
            editModeOn={true}
            region={region}
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
    </>
  );
};

export default PlanLocationForm;
