import { Feature } from 'geojson';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';
import * as turf from '@turf/turf';
import IconButton from '@mui/material/IconButton';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Box from '@mui/material/Box';
import get from 'lodash-es/get';
import { recalculateFeatureIds } from 'utils/mapBoundaryUploadHelpers';
import { useFormikContext, FieldArray } from 'formik';

import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';

const calculateTotalArea = (features: any) => {
  const featureCollection = turf.featureCollection(features);
  console.log('features', features);
  console.log('featureCollection', featureCollection);

  // TODO:
  // @ts-ignore
  // const overlap = turf.union(featureCollection);
  // console.log('overlap', overlap);
  // const total = features.reduce((acc: number, feature: any) => {
  //   return acc + feature.properties.areaHa;
  // }, 0);
  // console.log('total', total);
};

export interface MapFeatureListProps {
  features?: any;
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

  const featureStyle = {
    parent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 10rem 2rem',
      cursor: 'pointer'
    }
  };

  console.log('features', features);
  console.log('maskState', maskState);

  const totalArea = 0;
  const numberOfFeatures = features.length;

  calculateTotalArea(features);

  const maskChanged = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Update the feature object
    // @ts-ignore - Couldn't make typescript happy here, Event with null checks :(
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

  interface FeatureItemProps {
    properties?: any;
    feature: Feature;
    index: number;
    helper: any;
  }

  /**
   * FeatureItem
   * @param feature
   * @returns React component for a single feature item
   */
  const FeatureItem: React.FC<FeatureItemProps> = (item) => {
    const feature = item.feature;
    return (
      <Box
        style={featureStyle.parent}
        className={
          activeFeatureState[0] === feature.properties?.id ? 'feature-item active' : 'feature-item'
        }
        onMouseEnter={() => mouseEnterListItem(item.index)}
        onMouseLeave={() => mouseLeaveListItem()}>
        <Box className="feature-name">
          <CustomTextField
            name={`location.geometry[${item.index}].properties.siteName`}
            label=""
            other={{
              size: 'small',
              variant: 'standard',
              value: feature.properties?.siteName || ''
            }}
          />
        </Box>
        <Box className="feature-size">
          {feature.properties?.areaHa.toLocaleString({ useGrouping: true }) || 0} Hectares
        </Box>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={feature.properties?.maskedLocation || false}
                onChange={(event) => maskChanged(event, item.index)}
              />
            }
            label="Mask"
          />
        </FormGroup>
        <IconButton
          title="Delete Feature"
          onClick={() => {
            deleteListItem(item.index, item.helper);
          }}>
          <DeleteForeverOutlinedIcon />
        </IconButton>
      </Box>
    );
  };

  // return (
  //   <Box>
  //     {features.map((feature: Feature, index: number) => (
  //       <FeatureItem feature={feature} index={index} key={index} />
  //     ))}
  //   </Box>
  // );

  return (
    <>
      <Box>
        {numberOfFeatures} areas amounting to {totalArea} Hectares, excluding overlap.
      </Box>
      <FieldArray
        name="features"
        render={(arrayHelpers: any) => (
          <>
            {maskState.map((mask: boolean, index: number) => {
              return (
                <FeatureItem feature={features[index]} index={index} key={index} helper={arrayHelpers} />
              );
            })}
          </>
        )}></FieldArray>
    </>
  );
};

export default MapFeatureList;
