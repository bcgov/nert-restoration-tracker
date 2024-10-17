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
    orphanedWells: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    dormantWells: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
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
  const { boundary, orphanedWells, projects, plans, protectedAreas, seismic, baselayer } =
    props.layerVisibility;

  const dormantWells = props.layerVisibility.dormantWells || [];

  const basemapChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    baselayer[1](event.target.value);
  };

  const boundaryFilter = props.filterState?.boundary;
  const orphanedWellFilter = props.filterState?.orphanedWells;

  return (
    <div>
      <Box>
        {props.hideProjects !== true && (
          <Box>
            <Typography variant="h6" component="h3">
              Projects & Plans
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    title="Toggle visibility - Projects"
                    checked={projects[0]}
                    onClick={() => projects[1](!projects[0])}
                  />
                }
                label={
                  <label style={iconLegendStyle}>
                    <span>Projects</span>
                    <img
                      style={iconLegendIconStyle}
                      src="/assets/icon/marker-icon.png"
                      alt="projects"
                    />
                  </label>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    title="Toggle visibility - Plans"
                    checked={plans[0]}
                    onClick={() => plans[1](!plans[0])}
                  />
                }
                label={
                  <label style={iconLegendStyle}>
                    <span>Plans</span>
                    <img
                      style={iconLegendIconStyle}
                      src="/assets/icon/marker-icon2.png"
                      alt="plans"
                    />
                  </label>
                }
              />
            </FormGroup>
            <hr />
          </Box>
        )}
        <Typography variant="h6" component="h3">
          Context Layers
        </Typography>
        <FormGroup>
          <LayerControl
            title="Management Boundaries"
            subTitle="Natural resource management boundaries"
            layerState={boundary}>
            {props.legend.boundary && (
              <List dense sx={{ mt: 2 }}>
                {props.legend.boundary.map((item: any) => (
                  <ListItem key={item.label}>
                    <FormGroup>
                      <FormControlLabel
                        labelPlacement="start"
                        control={
                          <Checkbox
                            title="Toggle visibility - Management Boundaries"
                            edge="end"
                            checked={boundaryFilter[item.label][0]}
                            onChange={() =>
                              boundaryFilter[item.label][1](!boundaryFilter[item.label][0])
                            }
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <ListItemAvatar>
                              <Avatar
                                src={item.image}
                                style={{
                                  backgroundColor: item.color,
                                  borderColor: item.outlineColor
                                }}
                                className={item.outlineColor ? 'outlined' : ''}
                                alt="management-icon"
                              />
                            </ListItemAvatar>
                            <ListItemText sx={{ width: 180 }} primary={item.label} />
                          </Box>
                        }
                      />
                    </FormGroup>
                  </ListItem>
                ))}
              </List>
            )}
          </LayerControl>

          <LayerControl
            title="Protected Areas"
            subTitle="Parks, Conservancies and areas of special consideration."
            layerState={protectedAreas}>
            {/* Conditional rendering of legend */}
            {props.legend.protectedAreas && (
              <List dense sx={{ mt: 2 }}>
                {props.legend.protectedAreas.map((area: any) => {
                  return (
                    <ListItem key={area.label}>
                      <FormGroup>
                        <FormControlLabel
                          labelPlacement="start"
                          control={
                            <Checkbox
                              title="Toggle visibility - Protected Areas"
                              edge="end"
                              checked={area.visible}
                              onClick={() => (area.visible = !area.visible)}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <ListItemAvatar>
                                <Avatar
                                  src={area.image}
                                  style={{
                                    backgroundColor: area.color,
                                    borderColor: area.outlineColor
                                  }}
                                  className={area.outlineColor ? 'outlined' : ''}
                                  alt="protected-area-icon"
                                />
                              </ListItemAvatar>
                              <ListItemText sx={{ width: 180 }} primary={area.label} />
                            </Box>
                          }
                        />
                      </FormGroup>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </LayerControl>

          <LayerControl
            title="Orphaned Wells"
            subTitle="BC Energy Regulator orphaned wells and orphaned well activities"
            layerState={orphanedWells}>
            {props.legend.orphanedWells && (
              <List dense sx={{ mt: 2 }}>
                {props.legend.orphanedWells.map((well: any) => (
                  <ListItem key={well.label}>
                    <FormGroup>
                      <FormControlLabel
                        labelPlacement="start"
                        control={
                          <Checkbox
                            title="Toggle visibility - Orphaned Wells"
                            edge="end"
                            checked={orphanedWellFilter[well.label][0]}
                            onClick={() => {
                              orphanedWellFilter[well.label][1](!orphanedWellFilter[well.label][0]);
                            }}
                          />
                        }
                        label={
                          <Box display={'flex'} alignItems="center">
                            <ListItemAvatar>
                              <Avatar
                                src={well.image}
                                style={{
                                  backgroundColor: well.color,
                                  borderColor: well.outlineColor
                                }}
                                className={well.outlineColor ? 'outlined' : ''}
                                alt="orphaned-well-icon"
                              />
                            </ListItemAvatar>
                            <ListItemText sx={{ width: 180 }} primary={well.label} />
                          </Box>
                        }
                      />
                    </FormGroup>
                  </ListItem>
                ))}
              </List>
            )}
          </LayerControl>

          <LayerControl
            title="Dormant Wells"
            subTitle="Wells that are currently inactive"
            layerState={dormantWells}>
            {props.legend.dormantWells && (
              <List dense sx={{ mt: 2 }}>
                {props.legend.dormantWells.map((well: any) => (
                  <ListItem key={well.label} secondaryAction={<></>}>
                    <ListItemAvatar>
                      <Avatar
                        src={well.image}
                        style={{ backgroundColor: well.color, borderColor: well.outlineColor }}
                        className={well.outlineColor ? 'outlined' : ''}
                        alt="dormant-well-icon"
                      />
                    </ListItemAvatar>
                    <ListItemText primary={well.label} />
                  </ListItem>
                ))}
              </List>
            )}
          </LayerControl>

          <FormControlLabel
            control={
              <Checkbox
                title="Seismic Checkbox"
                checked={seismic[0]}
                onClick={() => seismic[1](!seismic[0])}
              />
            }
            label="Seismic Lines"
          />
        </FormGroup>
        <hr />
        <Typography variant="h6" component="h3">
          Base Layers
        </Typography>
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
