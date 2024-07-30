/**
 * This a common component to explain how to upload a GeoJSON file
 */

import React from 'react';
import Box from '@mui/material/Box';
import { Divider } from '@mui/material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const GeoJSONDescription = () => {
  return (
    <Box>
      <Typography variant="body1">
        <List dense={true} sx={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
          <ListItem sx={{ display: 'list-item' }}>
            All coordinates should be in the Geographic projection (EPSG:4326).
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            At least one Polygon or MultiPolygon feature is required.
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            No more then {process.env.REACT_APP_MAX_NUMBER_OF_FEATURES || '100'} features per file.
          </ListItem>
          <Divider>Optional</Divider>
          <ListItem sx={{ display: 'list-item' }}>
            The property <b>Site_Name</b> could be provided to autopopulate the site name field.
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            You can automatically turn on the <i>Mask</i> of a feature by setting the boolean value
            of <b>Masked_Location</b> to <i>true</i>.
          </ListItem>
        </List>
      </Typography>
    </Box>
  );
};

export default GeoJSONDescription;
