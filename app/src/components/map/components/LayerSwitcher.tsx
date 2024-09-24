/**
 * Layer Switcher Component
 * Turn layers on and off
 */
import CloseIcon from '@mui/icons-material/Close';
import LayersIcon from '@mui/icons-material/Layers';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Radio,
  RadioGroup
} from '@mui/material';
import React, { useState } from 'react';

export interface ILayerSwitcherProps {
  layerVisibility: {
    boundary: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    orphanedWells: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    projects: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    plans: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    protectedAreas: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    seismic: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    baselayer: [string, React.Dispatch<React.SetStateAction<string>>];
  };
  open?: boolean;
  hideProjects?: boolean;
}

const switcherStyle = {
  position: 'absolute',
  bottom: '120px',
  right: '10px',
  zIndex: 1000,
  padding: '10px',
  backgroundColor: 'white',
  borderRadius: '5px',
  boxShadow: '0 0 10px rgba(0,0,0,0.5)'
};

const switcherCloseStyle = {
  position: 'absolute',
  right: '2px',
  top: '2px'
};
const buttonStyle = {
  position: 'absolute',
  bottom: '120px',
  right: '10px',
  zIndex: 1000,
  backgroundColor: 'white',
  borderRadius: '5px',
  boxShadow: '0 0 10px rgba(0,0,0,0.5)'
};

const iconLegendStyle = {
  display: 'flex',
  alignItems: 'center'
};

const iconLegendIconStyle = {
  height: '30px',
  marginLeft: '5px'
};

const LayerSwitcher = (props: ILayerSwitcherProps) => {
  const { boundary, orphanedWells, projects, plans, protectedAreas, seismic, baselayer } =
    props.layerVisibility;

  const [switcherOpen, setSwitcherOpen] = useState(props.open ? true : false);

  const toggleLayerswitcher = () => setSwitcherOpen(!switcherOpen);

  const basemapChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    baselayer[1](event.target.value);
  };

  return (
    <div>
      {!switcherOpen ? (
        <Box title="Open Layer Picker" sx={buttonStyle}>
          <IconButton onClick={toggleLayerswitcher}>
            <LayersIcon />
          </IconButton>
        </Box>
      ) : (
        <Box sx={switcherStyle}>
          <Box title="Close Layer Picker" sx={switcherCloseStyle}>
            <IconButton onClick={toggleLayerswitcher}>
              <CloseIcon />
            </IconButton>
          </Box>
          {props.hideProjects !== true && (
            <Box>
              <b>Projects & Plans</b>
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
          <b>Context Layers</b>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={boundary[0]} onClick={() => boundary[1](!boundary[0])} />}
              label="Natural Resource Mgmt. Boundaries"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={orphanedWells[0]}
                  onClick={() => orphanedWells[1](!orphanedWells[0])}
                />
              }
              label="Orphaned Wells"
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
            <FormControlLabel
              control={<Checkbox checked={seismic[0]} onClick={() => seismic[1](!seismic[0])} />}
              label="Seismic Lines"
            />
          </FormGroup>
          <hr />
          <b>Base Layers</b>
          <RadioGroup value={baselayer[0]} onChange={basemapChanged}>
            <FormControlLabel value="hybrid" control={<Radio />} label="Satellite" />
            <FormControlLabel value="terrain" control={<Radio />} label="Terrain" />
            <FormControlLabel value="bcgov" control={<Radio />} label="BC Gov" />
          </RadioGroup>
        </Box>
      )}
    </div>
  );
};

export default LayerSwitcher;
