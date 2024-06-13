import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import React from 'react';
import { IUseState } from 'contexts/mapContext';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';

export interface MapFeatureListProps {
  features: Feature<Geometry, GeoJsonProperties>[];
  mask: IUseState<number | null>; // Store what mask just changed
  maskState: IUseState<boolean[]>; // Store which features are masked
  activeFeatureState: IUseState<number | null>; // Store which feature is active
}

const MapFeatureList: React.FC<MapFeatureListProps> = (props) => {
  const features = props.features || [];
  const maskState = props.maskState || [];
  const mask = props.mask || 0;
  const activeFeatureState = props.activeFeatureState || [];

  const featureStyle = {
    parent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr auto',
      cursor: 'pointer'
    }
  };

  const maskChanged = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Update the feature object
    if (!features[index].properties) features[index].properties = {};

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
    activeFeatureState[1](null);
  };

  return (
    <div>
      {features.map((feature: Feature, index: number) => (
        <div
          style={featureStyle.parent}
          className={
            activeFeatureState[0] === feature.properties?.id
              ? 'feature-item active'
              : 'feature-item'
          }
          key={index}
          onMouseEnter={() => mouseEnterListItem(index)}
          onMouseLeave={() => mouseLeaveListItem()}>
          <div className="feature-name">{feature.properties?.siteName || `Area ${index + 1}`}</div>
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
    </div>
  );
};

export default MapFeatureList;
