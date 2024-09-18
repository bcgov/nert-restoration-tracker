/**
 * Layer Switcher Component
 * Turn layers on and off
 */
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import React from 'react';
import LayerControl from './LayerControl';

export interface ILayerSwitcherProps {
  layerVisibility: {
    boundary: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    wells: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    projects: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    plans: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    protectedAreas: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    seismic: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    baselayer: [string, React.Dispatch<React.SetStateAction<string>>];
  };
  hideProjects?: boolean;
}

const iconLegendStyle = {
  display: 'flex',
  alignItems: 'center'
};

const iconLegendIconStyle = {
  height: '30px',
  marginLeft: '5px'
};

const LayerSwitcherInline = (props: ILayerSwitcherProps) => {
  const { boundary, wells, projects, plans, protectedAreas, seismic, baselayer } =
    props.layerVisibility;

  const basemapChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    baselayer[1](event.target.value);
  };

  return (
    <div>
      <Box>
        {props.hideProjects !== true && (
          <Box>
            <Typography variant="h6">Projects & Plans</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={projects[0]} onClick={() => projects[1](!projects[0])} />
                }
                label={
                  <div style={iconLegendStyle}>
                    <span>Projects</span>
                    <img
                      style={iconLegendIconStyle}
                      src="/assets/icon/marker-icon.png"
                      alt="projects"
                    />
                  </div>
                }
              />
              <FormControlLabel
                control={<Checkbox checked={plans[0]} onClick={() => plans[1](!plans[0])} />}
                label={
                  <div style={iconLegendStyle}>
                    <span>Plans</span>
                    <img
                      style={iconLegendIconStyle}
                      src="/assets/icon/marker-icon2.png"
                      alt="plans"
                    />
                  </div>
                }
              />
            </FormGroup>
            <hr />
          </Box>
        )}
        <Typography variant="h6">Context Layers</Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={boundary[0]} onClick={() => boundary[1](!boundary[0])} />}
            label="Natural Resource Mgmt. Boundaries"
          />
          <FormControlLabel
            control={<Checkbox checked={wells[0]} onClick={() => wells[1](!wells[0])} />}
            label="Wells"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={protectedAreas[0]}
                onClick={() => protectedAreas[1](!protectedAreas[0])}
              />
            }
            label="Protected Areas"
          />

          <LayerControl
            title="Protected Areas"
            subTitle="Parks, Conservancies and areas of special consideration.">
            <Box>Testing 1 2 3 Testing 4 5 6</Box>
          </LayerControl>

          <FormControlLabel
            control={<Checkbox checked={seismic[0]} onClick={() => seismic[1](!seismic[0])} />}
            label="Seismic Lines"
          />
        </FormGroup>
        <hr />
        <Typography variant="h6">Base Layers</Typography>
        <RadioGroup value={baselayer[0]} onChange={basemapChanged}>
          <FormControlLabel value="hybrid" control={<Radio />} label="Satellite" />
          <FormControlLabel value="terrain" control={<Radio />} label="Terrain" />
          <FormControlLabel value="bcgov" control={<Radio />} label="BC Gov" />
        </RadioGroup>
      </Box>
    </div>
  );
};

export default LayerSwitcherInline;
