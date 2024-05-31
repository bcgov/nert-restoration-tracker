import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import IntegerSingleField from 'components/fields/IntegerSingleField';
import MapContainer from 'components/map/MapContainer2';
import { MapStateContext } from 'contexts/mapContext';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useState } from 'react';
import { handleGeoJSONUpload } from 'utils/mapBoundaryUploadHelpers';
import yup from 'utils/YupSchema';

export interface IPlanLocationForm {
  location: {
    region: number;
    number_sites: number;
    size_ha: number;
    geometry: Feature[];
  };
}

export const PlanLocationFormInitialValues: IPlanLocationForm = {
  location: {
    region: '' as unknown as number,
    number_sites: '' as unknown as number,
    size_ha: '' as unknown as number,
    geometry: [] as unknown as Feature[]
  }
};

export const PlanLocationFormYupSchema = yup.object().shape({
  location: yup.object().shape({
    region: yup.string().required('Required'),
    number_sites: yup.number().min(1, 'At least one site is required').required('Required'),
    size_ha: yup.number().nullable(),
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
 * Create Plan - Location section
 *
 * @return {*}
 */
const PlanLocationForm: React.FC<IPlanLocationFormProps> = (props) => {
  const formikProps = useFormikContext<IPlanLocationForm>();
  const { errors, touched, values, handleChange } = formikProps;

  const layerVisibility = useContext(MapStateContext).layerVisibility;

  const [openUploadBoundary, setOpenUploadBoundary] = useState(false);

  const [maskState, setMaskState] = useState<boolean[]>(
    values.location.geometry.map((feature) => feature?.properties?.maskedLocation) || []
  );

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
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

  useEffect(() => {
    console.log('active feature just changed', activeFeature);
  }, [activeFeature]);

  const featureStyle = {
    parent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr auto',
      cursor: 'pointer'
    }
  };

  const maskChanged = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Update the formik values
    // @ts-ignore
    values.location.geometry[index].properties.maskedLocation = event.target.checked;

    // Update the local state
    setMaskState(() => {
      const newState = [...maskState];
      newState[index] = event.target.checked;
      return newState;
    });

    // Make sure children know what has changed
    setMask(index);
  };

  // TODO: Connect these to the map state for active shapes
  const mouseEnterListItem = (index: number) => {
    console.log('mouse enter', index);
    console.log(values.location.geometry[index]);
    setActiveFeature(values.location.geometry[index]);
  };
  const mouseLeaveListItem = (index: number) => {
    console.log('mouse leave', index);
    setActiveFeature(null);
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

        <Box mb={4}>
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <IntegerSingleField
                name={'location.size_ha'}
                label={'Plan Size in Hectares (total area including all sites)'}
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
        <Typography component="legend">Plan Areas *</Typography>
        <Box mb={3} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Upload a GeoJSON file to define your Plan boundary.
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
            data-testid="Plan-boundary-upload">
            Upload Areas
          </Button>
        </Box>

        <Box className="feature-box">
          {/* Create a list element for each feature within values.location.geometry */}
          {/* TODO: Utilize MUI Components instead of custom divs */}
          {values.location.geometry.map((feature, index) => (
            <div
              style={featureStyle.parent}
              className={activeFeature?.id === feature?.id ? 'feature-item active' : 'feature-item'}
              key={index}
              onMouseEnter={() => mouseEnterListItem(index)}
              onMouseLeave={() => mouseLeaveListItem(index)}>
              <div className="feature-name">
                {feature.properties?.siteName || `Area ${index + 1}`}
              </div>
              <div className="feature-size">{feature.properties?.areaHectares || 0} Ha</div>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={feature.properties?.maskedLocation || false}
                      onChange={(event) => maskChanged(event, index)}
                    />
                  }
                  label="Mask"
                />
              </FormGroup>
            </div>
          ))}
        </Box>

        <Box height={500}>
          <MapContainer
            mapId={'plan_location_map'}
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
