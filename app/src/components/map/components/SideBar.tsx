import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';


// SideBar interface to be passed the sidebarOpen
export interface ISideBarProps {
  sidebarOpen: boolean;
} 

const SideBar = (props: ISideBarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={() => setOpen(false)}
    >
      <Box sx={{ width: 250 }}>
        <h2>SideBar</h2>
      </Box>
    </Drawer>
  )
}

export default SideBar;