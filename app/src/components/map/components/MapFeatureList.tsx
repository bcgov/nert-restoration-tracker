import { Feature } from 'geojson';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Box from '@mui/material/Box';
import get from 'lodash-es/get';
import { recalculateFeatureIds } from 'utils/mapBoundaryUploadHelpers';
import { useFormikContext, FieldArray } from 'formik';

import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';

interface FeatureItemProps {
  properties?: any;
  feature: Feature;
  index: number;
  helper: any;
  maskState: any;
  mask: any;
  activeFeatureState: any;
  setFieldValue: any;
  values: any;
}

/**
 * FeatureItem
 * @param feature
 * @returns React component for a single feature item
 */
const FeatureItem: React.FC<FeatureItemProps> = (props) => {
  const feature = props.feature;
  const maskState = props.maskState;
  const mask = props.mask;
  const activeFeatureState = props.activeFeatureState;
  const setFieldValue = props.setFieldValue;
  const values = props.values;

  const maskChanged = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Update the feature object
    // @ts-ignore - Couldn't make typescript happy here, Event with null checks :(
    const features = values.location.geometry || [];

    features[index].properties.maskedLocation = event.target.checked;

    // Update the local state
    maskState[1](() => {
      const newState = [...maskState];
      newState[index] = event.target.checked;
      return newState;
    });

    // Make sure children know what has changed
    mask[1](index);
  };

  // Highlight the list item and the map feature
  const mouseEnterListItem = (index: number) => {
    activeFeatureState[1](index + 1);
  };
  const mouseLeaveListItem = () => {
    activeFeatureState[1](null);
  };

  const deleteListItem = (index: number, helper: any) => {
    const location = get(values, 'location');
    const oldFeatureList = get(values, 'location.geometry');
    const newFeatureList = recalculateFeatureIds(
      oldFeatureList.filter((f: Feature, i: number) => i !== index)
    );

    location.geometry = newFeatureList;
    setFieldValue('location', location);

    // This causes the indexes in the map and list items to be out of sync
    // helper.remove(index);

    // Reset the hover state
    mouseLeaveListItem();

    // To keep the map happy, we need to update the maskState
    maskState[1](() => {
      const oldState = maskState[0];
      const newState = oldState.filter((f: boolean, i: number) => i !== index);
      return newState;
    });
  };

  const featureStyle = {
    parent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 10rem 2rem',
      cursor: 'pointer'
    }
  };

  return (
    // If there is a feature, render the following
    feature && (
      <Box
        style={featureStyle.parent}
        key={props.index}
        className={
          activeFeatureState[0] === feature.properties?.id ? 'feature-item active' : 'feature-item'
        }
        onMouseEnter={() => mouseEnterListItem(props.index)}
        onMouseLeave={() => mouseLeaveListItem()}>
        <Box className="feature-name">
          <CustomTextField
            name={`location.geometry[${props.index}].properties.siteName`}
            label=""
            other={{
              size: 'small',
              variant: 'standard',
              placeholder: 'Site Name',
              value: feature.properties?.siteName || '',
              required: true
            }}
          />
        </Box>
        <Box className="feature-size">
          {(feature.properties?.areaHa &&
            feature.properties?.areaHa.toLocaleString({ useGrouping: true })) ||
            0}{' '}
          Hectares
        </Box>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={feature.properties?.maskedLocation || false}
                onChange={(event) => maskChanged(event, props.index)}
              />
            }
            label="Mask"
          />
        </FormGroup>
        <IconButton
          title="Delete Feature"
          onClick={() => {
            deleteListItem(props.index, props.helper);
          }}>
          <DeleteForeverOutlinedIcon />
        </IconButton>
      </Box>
    )
  );
};

export interface MapFeatureListProps {
  // features?: any;
  mask?: any; // Store what mask just changed
  maskState?: any; // Store which features are masked
  activeFeatureState?: any; // Store which feature is active
}

const MapFeatureList: React.FC<MapFeatureListProps> = (props) => {
  const maskState = props.maskState || [];
  const mask = props.mask || 0;
  const activeFeatureState = props.activeFeatureState || [];

  const formikProps = useFormikContext<IProjectLocationForm>();
  const { values, setFieldValue } = formikProps;

  const features = values.location.geometry || [];

  const areaStatsStyle = {
    textAlign: 'right',
    fontWeight: 200,
    color: 'rgba(0, 0, 0, 0.54)',
    marginBottom: '0.5rem'
  };

  // This adds commas to numbers for readability.
  const numberFormatter = new Intl.NumberFormat(undefined, { useGrouping: true });

  return (
    <>
      <Box sx={areaStatsStyle}>
        {values.location.number_sites} areas amounting to{' '}
        {numberFormatter.format(values.location.size_ha)} Hectares, excluding overlap.
      </Box>
      <FieldArray
        name="features"
        render={(arrayHelpers: any) => (
          <>
            {features.map((feature: Feature, index: number) => {
              return (
                <FeatureItem
                  feature={feature}
                  index={index}
                  key={index}
                  helper={arrayHelpers}
                  maskState={maskState}
                  mask={mask}
                  activeFeatureState={activeFeatureState}
                  setFieldValue={setFieldValue}
                  values={values}
                />
              );
            })}
          </>
        )}></FieldArray>
    </>
  );
};

export default MapFeatureList;
