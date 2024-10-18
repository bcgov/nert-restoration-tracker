import React, { useState } from 'react';

import {
  Box,
  Checkbox,
  IconButton,
  FormGroup,
  FormControlLabel,
  Typography,
  Grid
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import './LayerControl.css';

const layerControlStyle = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr auto'
  },
  title: {
    textoverflow: 'ellipsis',
    fontWeight: 'bold',
    fontSize: '1em',
    marginTop: '10px'
  },
  drawer: {
    gridColumn: '1 / 5',
    textWrap: 'pretty',
    margin: '3px 15px 3px 3px'
  }
};

export interface ILayerControlProps {
  layerState: any;
  title: string;
  subTitle?: string;
  children?: React.ReactNode;
}

const LayerControl = (props: ILayerControlProps) => {
  const { layerState, title } = props;
  const subTitle = props.subTitle || '';
  const children = props.children || null;
  const [infoOpen, setInfoOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <InfoDialogDraggable
        dialogTitle={title}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        isProject={null}>
        Content coming soon
      </InfoDialogDraggable>
      <Box sx={layerControlStyle.container}>
        <Grid
          container
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <Grid item xs={10}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    title="Layer State"
                    checked={layerState[0]}
                    onClick={() => layerState[1](!layerState[0])}
                  />
                }
                label={
                  <Box mt={2} sx={layerControlStyle.title}>
                    <Typography variant="h4">{title}</Typography>
                    <Typography variant="caption">{subTitle}</Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Grid>
          <Grid item xs={2}>
            <Box>
              <Box title="View more information">
                <IconButton
                  title="info"
                  ariel-label="Information"
                  onClick={() => setInfoOpen(!infoOpen)}>
                  <InfoIcon />
                </IconButton>
              </Box>
              <Box>
                <IconButton
                  title="Filter and/or legend"
                  ariel-label="Filter and/or legend"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={filterOpen ? 'filter button open' : 'filter button closed'}>
                  <KeyboardArrowLeftIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          {/* here is a drawer that will be expanded when the filter/legend button is clicked */}
          <Grid
            item
            xs={12}
            sx={layerControlStyle.drawer}
            className={filterOpen ? 'filter drawer open' : 'filter drawer closed'}>
            {children}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default LayerControl;
