import Box from '@mui/material/Box';
import React from 'react';

const pageStyles = {
  projectsLayoutRoot: {
    paddingTop: '20px',
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
 * @param {*} props
 * @return {*}
 */
const ProjectsLayout: React.FC = (props) => {
  return <Box sx={pageStyles.projectsLayoutRoot}>{props.children}</Box>;
};

export default ProjectsLayout;
