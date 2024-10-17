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
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
import { handleGeoJSONUpload } from 'utils/mapBoundaryUploadHelpers';
import yup, { locationRequired } from 'utils/YupSchema';
import './styles/projectLocation.css';
import ProjectLocationConservationAreas, {
  IProjectLocationConservationAreasArrayItem,
  ProjectLocationConservationAreasFormArrayItemInitialValues
} from 'features/projects/components/ProjectLocationConservationAreasForm';
import { ICreateProjectRequest, IEditProjectRequest } from 'interfaces/useProjectApi.interface';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { CreateProjectI18N } from 'constants/i18n';

export interface IProjectLocationForm {
  location: {
    geometry: Feature[] | null;
    number_sites: number | null;
    region: number | string | null;
    is_within_overlapping: string | null;
    size_ha: number | null;
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
    region: yup.string(),
    geometry: yup.array(),
    is_within_overlapping: yup.string().notRequired(),
    size_ha: yup.number().nullable(),
    number_sites: yup.number(),
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
  const parentFormikProps = useFormikContext<ICreateProjectRequest | IEditProjectRequest>();

  const { errors, touched, values, handleChange, setFieldValue } = formikProps;

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
  const orphanedWells = useState<boolean>(false);
  const projects = useState<boolean>(true);
  const plans = useState<boolean>(true);
  const protectedAreas = useState<boolean>(false);
  const seismic = useState<boolean>(false);
  const baselayer = useState<string>('hybrid');

  const layerVisibility = {
    boundary,
    orphanedWells,
    projects,
    plans,
    protectedAreas,
    seismic,
    baselayer
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

  const [region, setRegion] = useState('');
  useEffect(() => {
    const selectedRegion = props.regions.find((r) => r.value === values.location.region);
    setRegion(selectedRegion ? selectedRegion.label : '');
  }, [values.location.region]);

  return (
    <>
      <InfoDialogDraggable
        isProject={true}
        open={infoOpen}
        dialogTitle={infoTitle}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={true} contentIndex={infoTitle} />
      </InfoDialogDraggable>

      <Box mb={5} mt={0}>
        <Box mb={2}>
          <Typography component="legend">
            Area and Location Details
            <IconButton
              edge="end"
              onClick={() => handleClickOpen(CreateProjectI18N.locationRegion)}>
              <InfoIcon color="info" />
            </IconButton>
          </Typography>
        </Box>
        <Box mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
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
                <InputLabel id="nrm-region-select-label">
                  Natural Resource Management Region
                </InputLabel>
                <Select
                  id="nrm-region-select"
                  name="location.region"
                  labelId="nrm-region-select-label"
                  label="Natural Resource Management Region"
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
              Is the project within or overlapping a known area of cultural or conservation?
              <IconButton
                edge="end"
                onClick={() => handleClickOpen(CreateProjectI18N.locationConservationArea)}>
                <InfoIcon color="info" />
              </IconButton>
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
        <Typography component="legend">
          {CreateProjectI18N.locationArea}{' '}
          {locationRequired(
            parentFormikProps.values.focus.focuses ? parentFormikProps.values.focus.focuses : []
          ) && '*'}
          <IconButton edge="end" onClick={() => handleClickOpen(CreateProjectI18N.locationArea)}>
            <InfoIcon color="info" />
          </IconButton>
        </Typography>
        <Box mb={3} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Upload a GeoJSON file to define your project boundary.
            <Tooltip title={CreateProjectI18N.locationGeoJSONProperties} placement="right">
              <IconButton
                edge="end"
                onClick={() => handleClickOpen(CreateProjectI18N.locationGeoJSONProperties)}>
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
        dialogTitle="Upload Project Areas"
        onClose={() => setOpenUploadBoundary(false)}>
        <FileUpload
          uploadHandler={getUploadHandler()}
          dropZoneProps={{
            name: 'project-boundary-upload',
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
