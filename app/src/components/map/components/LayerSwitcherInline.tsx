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
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import React from 'react';
import LayerControl from './LayerControl';
import './LayerSwitcherInline.css';

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
  legend?: any;
  hideProjects?: boolean;
  filterState?: any;
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
  const { boundary, wells, projects, plans, protectedAreas, seismic, baselayer } = props.layerVisibility;
  const basemapChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    baselayer[1](event.target.value);
  };

  const boundaryFilter = props.filterState?.boundary;

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
          {/* Natural Resource Mgmt. Boundaries */}
          {/* TODO: Convert this to a LayerControl */}
          
          <LayerControl
            title="Management Boundaries"
            subTitle="Natural resource management boundaries"
            layerState={boundary}>
            {props.legend.boundary && (
              <List dense>
                {props.legend.boundary.map((item: any) => (
                  <ListItem key={item.label} secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={boundaryFilter[item.label][0]}
                      onChange={() => boundaryFilter[item.label][1](!boundaryFilter[item.label][0])}
                    />
                  }>
                    {/* <ListItemAvatar>
                      <Avatar style={{ backgroundColor: item.color }}>
                        &nbsp;
                      </Avatar>
                    </ListItemAvatar> */}
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            )}
          </LayerControl>

          <FormControlLabel
            control={<Checkbox checked={wells[0]} onClick={() => wells[1](!wells[0])} />}
            label="Wells"
          />

          <LayerControl
            title="Protected Areas"
            subTitle="Parks, Conservancies and areas of special consideration."
            layerState={protectedAreas}>
            {/* Conditional rendering of legend */}
            {props.legend.protectedAreas && (
              <List dense>
                {props.legend.protectedAreas.map((area: any) => {
                  return (
                    <ListItem
                      key={area.label}
                      secondaryAction={
                        // Only show the checkbox if the area allows toggling
                        area.allowToggle && (
                          <Checkbox
                            edge="end"
                            checked={area.visible}
                            onClick={() => (area.visible = !area.visible)}
                          />
                        )
                      }>
                      <ListItemAvatar>
                        <Avatar
                          src={area.image}
                          style={{ backgroundColor: area.color, borderColor: area.outlineColor }}
                          className={area.outlineColor ? 'outlined' : ''}>
                          &nbsp;
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={area.label} />
                    </ListItem>
                  );
                })}
              </List>
            )}
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
