/**
 * Layer Switcher Component
 * Turn layers on and off
 */
import CloseIcon from '@mui/icons-material/Close';
import LayersIcon from '@mui/icons-material/Layers';
import { Box, Checkbox, FormControlLabel, FormGroup, IconButton } from '@mui/material';
import React, { useState } from 'react';

export interface ILayerSwitcherProps {
  layerVisibility: {
    boundary: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    wells: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    projects: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    plans: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    wildlife: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    indigenous: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  };
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

const LayerSwitcher = (props: ILayerSwitcherProps) => {
  const { boundary, wells, projects, plans, wildlife, indigenous } = props.layerVisibility;

  const toggleLayerswitcher = () => setSwitcherOpen(!switcherOpen);

  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <div>
      {switcherOpen ? (
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
          <b>Context Layers</b>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={boundary[0]} onClick={() => boundary[1](!boundary[0])} />}
              label="Project Boundary"
            />
            <FormControlLabel
              control={<Checkbox checked={wells[0]} onClick={() => wells[1](!wells[0])} />}
              label="Wells"
            />
            <FormControlLabel
              control={<Checkbox checked={projects[0]} onClick={() => projects[1](!projects[0])} />}
              label="Projects"
            />
            <FormControlLabel
              control={<Checkbox checked={plans[0]} onClick={() => plans[1](!plans[0])} />}
              label="Plans"
            />
            <FormControlLabel
              control={<Checkbox checked={wildlife[0]} onClick={() => wildlife[1](!wildlife[0])} />}
              label="Wildlife"
            />
            <FormControlLabel
              control={
                <Checkbox checked={indigenous[0]} onClick={() => indigenous[1](!indigenous[0])} />
              }
              label="Indigenous"
            />
          </FormGroup>
        </Box>
      )}
    </div>
  );
};

export default LayerSwitcher;
