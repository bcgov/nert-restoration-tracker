import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

// SideBar interface to be passed the sidebarOpen
export interface ISideBarProps {
  sidebarOpen: boolean;
  children?: React.ReactNode;
}

const SideBar = (props: ISideBarProps) => {
  const { sidebarOpen } = props;

  return (
    <Drawer
      anchor="left"
      open={sidebarOpen}
      variant="persistent"
      sx={{
        '& .MuiDrawer-root': { position: 'absolute' },
        '& .MuiDrawer-paper': { position: 'absolute' }
      }}>
      <Box sx={{ width: '240px', padding: '10px', margin: '10px' }}>{props.children}</Box>
    </Drawer>
  );
};

export default SideBar;
