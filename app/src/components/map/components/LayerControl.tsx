import React, { useState } from 'react';

import { Box, Checkbox, CardMedia, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import './LayerControl.css';

const layerControlStyle = {
  container: {
    display: 'grid',
    marginLeft: '-10px',
    gridTemplateColumns: 'auto auto 1fr auto'
  },
  title: {
    textoverflow: 'ellipsis',
    fontWeight: 'bold',
    fontSize: '1.3em',
    marginTop: '10px'
  },
  drawer: {
    gridColumn: '1 / 5',
    textWrap: 'pretty',
    margin: '3px 15px 3px 25px'
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
  const [filterOpen, setFilterOpen] = useState(true);

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
        <Box>
          <Checkbox checked={layerState[0]} onClick={() => layerState[1](!layerState[0])} />
        </Box>
        <Box>{/* <CardMedia /> */}</Box>
        <Box>
          <Box sx={layerControlStyle.title}>{title}</Box>
          <Box>{subTitle}</Box>
        </Box>
        <Box>
          <Box title="View more information">
            <IconButton ariel-label="Information" onClick={() => setInfoOpen(!infoOpen)}>
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
        {/* here is a drawer that will be expanded when the filter/legend button is clicked */}
        <Box
          sx={layerControlStyle.drawer}
          className={filterOpen ? 'filter drawer open' : 'filter drawer closed'}>
          {children}
        </Box>
      </Box>
    </>
  );
};

export default LayerControl;
