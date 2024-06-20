import { Feature } from 'geojson';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, { useContext } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Box from '@mui/material/Box';
import { recalculateFeatureIds } from 'utils/mapBoundaryUploadHelpers';
import { FieldArray } from 'formik';
import { MapStateContext } from 'contexts/mapContext';

export interface IMapFeatureListProps {
  features: Feature[];
}

const MapFeatureList: React.FC<IMapFeatureListProps> = (props) => {
  const mapContext = useContext(MapStateContext);
  const { maskHandler, activeFeatureState } = mapContext;
  const { mask, maskState } = maskHandler;

  const features = props.features || [];

  const maskChanged = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!features[index].properties) return;

    // Update the feature object
    features[index].properties.maskedLocation = event.target.checked;

    // Update the local state
    maskState[1](() => {
      const newState = [...maskState[0]];
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
    activeFeatureState[1](undefined);
  };

  return (
    <>
      <FieldArray
        name="features"
        render={(arrayHelpers) => (
          <>
            {features.map((feature: Feature, index: number) => {
              return (
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 10rem 2rem',
                    cursor: 'pointer'
                  }}
                  className={
                    activeFeatureState[0] === feature.properties?.id
                      ? 'feature-item active'
                      : 'feature-item'
                  }
                  key={index}
                  onMouseEnter={() => mouseEnterListItem(index)}
                  onMouseLeave={() => mouseLeaveListItem()}>
                  <Box className="feature-name">
                    {feature.properties?.siteName || `Area ${index + 1}`}
                  </Box>
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
                    onClick={async () => {
                      await arrayHelpers.remove(index);
                      await recalculateFeatureIds(features);
                    }}>
                    <DeleteForeverOutlinedIcon />
                  </IconButton>
                </Box>
              );
            })}
          </>
        )}></FieldArray>
    </>
  );
};

export default MapFeatureList;
