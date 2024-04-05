/**
 * Layer Switcher Component
 * Turn layers on and off
 */
import { Box, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import React from 'react';

export interface ILayerSwitcherProps {
  layerVisibility: {
    boundary: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    wells: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    projects: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    wildlife: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    indigenous: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  };
}

const style = {
  position: 'absolute',
  bottom: '90px',
  left: '20px',
  zIndex: 1000,
  padding: '10px',
  backgroundColor: 'white',
  borderRadius: '5px',
  boxShadow: '0 0 10px rgba(0,0,0,0.5)'
};

const LayerSwitcher = (props: ILayerSwitcherProps) => {
  const { boundary, wells, projects, wildlife, indigenous } =
    props.layerVisibility;
  return (
    <Box sx={style}>
      Layer Switcher
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={boundary[0]}
              onClick={() => boundary[1](!boundary[0])}
            />
          }
          label="Project Boundary"
        />
        <FormControlLabel
          control={
            <Checkbox checked={wells[0]} onClick={() => wells[1](!wells[0])} />
          }
          label="Wells"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={projects[0]}
              onClick={() => projects[1](!projects[0])}
            />
          }
          label="Projects"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={wildlife[0]}
              onClick={() => wildlife[1](!wildlife[0])}
            />
          }
          label="Wildlife"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={indigenous[0]}
              onClick={() => indigenous[1](!indigenous[0])}
            />
          }
          label="Indigenous"
        />
      </FormGroup>
    </Box>
  );
};

export default LayerSwitcher;
