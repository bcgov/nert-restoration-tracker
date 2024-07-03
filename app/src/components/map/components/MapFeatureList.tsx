import { Feature } from 'geojson';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, { useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Box from '@mui/material/Box';
import get from 'lodash-es/get';
import { recalculateFeatureIds } from 'utils/mapBoundaryUploadHelpers';
import { useFormikContext, FieldArray } from 'formik';

import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';

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

  /**
   * When editing an existing project or plan there may be some existing features
   * that need to be updated. This effect will recalculate the feature ids.
   */
  useEffect(() => {
    const featureList = get(values, 'location.geometry');
    if (featureList.length > 0) {
      setFieldValue('location.geometry', recalculateFeatureIds(featureList));
    }
  }, []);

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
        key={item.index}
        onMouseEnter={() => mouseEnterListItem(item.index)}
        onMouseLeave={() => mouseLeaveListItem()}>
        <Box className="feature-name">
          {feature.properties?.siteName || `Area ${item.index + 1}`}
        </Box>
        <Box className="feature-size">{feature.properties?.areaHa || 0} Ha</Box>
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
      <FieldArray
        name="features"
        render={(arrayHelpers: any) => (
          <>
            {features.map((feature: Feature, index: number) => {
              return (
                <FeatureItem feature={feature} index={index} key={index} helper={arrayHelpers} />
              );
            })}
          </>
        )}></FieldArray>
    </>
  );
};

export default MapFeatureList;
