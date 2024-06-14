import { Feature } from 'geojson';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import React from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Box from '@mui/material/Box';
import get from 'lodash-es/get';


export interface MapFeatureListProps {
  features?: any;
  mask?: any; // Store what mask just changed
  maskState?: any; // Store which features are masked
  activeFeatureState?: any; // Store which feature is active
  formikProps: any;
}

const MapFeatureList: React.FC<MapFeatureListProps> = (props) => {
  const features = props.features || [];
  const maskState = props.maskState || [];
  const mask = props.mask || 0;
  const activeFeatureState = props.activeFeatureState || [];
  const formikProps = props.formikProps || {};

  const { values, setFieldValue } = formikProps;

  const featureStyle = {
    parent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 10rem 2rem',
      cursor: 'pointer'
    }
  };

  const maskChanged = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Update the feature object
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

  const deleteListItem = (index: number) => {
    const location = get(values, 'location');
    const oldFeatureList = get(values, 'location.geometry');
    const newFeatureList = oldFeatureList.filter((f: Feature, i: number) => i !== index); 
    location.geometry = newFeatureList;
    setFieldValue('location', location);

    // Reset the hover state
    mouseLeaveListItem();

    // To keep the map happy, we need to update the maskState
    maskState[1](() => {
      const oldState = maskState[0];
      const newState = oldState.filter((f: boolean, i: number) => i !== index); 
      return newState;
    });
  };


  return (
    <Box>
      {features.map((feature: Feature, index: number) => (
        <Box
          style={featureStyle.parent}
          className={
            activeFeatureState[0] === feature.properties?.id
              ? 'feature-item active'
              : 'feature-item'
          }
          key={index}
          onMouseEnter={() => mouseEnterListItem(index)}
          onMouseLeave={() => mouseLeaveListItem()}>
          <Box className="feature-name">{feature.properties?.siteName || `Area ${index + 1}`}</Box>
          <Box className="feature-size">{feature.properties?.areaHectares || 0} Ha</Box>
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
          <IconButton
            title="Delete Feature"
            onClick={() => {
              deleteListItem(index);
            }}>
            <DeleteForeverOutlinedIcon />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default MapFeatureList;
