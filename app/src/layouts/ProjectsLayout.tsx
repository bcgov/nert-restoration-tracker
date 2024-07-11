import Box from '@mui/material/Box';
import React from 'react';
import { Outlet } from 'react-router-dom';

const pageStyles = {
  projectsLayoutRoot: {
    paddingTop: '10px',
    position: 'relative',
    width: 'inherit',
    height: '100%',
    flex: '1',
    flexDirection: 'column'
  }
};

/**
 * Layout for all project pages.
 *
 * @return {*}
 */
const ProjectsLayout = () => {
  return (
    <>
      <Box sx={pageStyles.projectsLayoutRoot}>
        <Outlet />
      </Box>
    </>
  );
};

export default ProjectsLayout;
