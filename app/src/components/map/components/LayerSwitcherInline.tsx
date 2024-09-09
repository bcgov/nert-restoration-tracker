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

export interface ILayerSwitcherProps {
  layerVisibility: {
    boundary: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    wells: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    projects: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    plans: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    wildlife: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    indigenous: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
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
  const { boundary, wells, projects, plans, wildlife, indigenous, baselayer } =
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
              label="Region Boundaries"
            />
            <FormControlLabel
              control={<Checkbox checked={wells[0]} onClick={() => wells[1](!wells[0])} />}
              label="Wells"
            />
            <FormControlLabel
              control={<Checkbox checked={wildlife[0]} onClick={() => wildlife[1](!wildlife[0])} />}
              label="Wildlife"
            />
            <FormControlLabel
              control={
                <Checkbox checked={indigenous[0]} onClick={() => indigenous[1](!indigenous[0])} />
              }
              label="MKMA"
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
