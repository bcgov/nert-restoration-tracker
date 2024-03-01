import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  projectsLayoutRoot: {
    paddingTop: '20px',
    position: 'relative',
    width: 'inherit',
    height: '100%',
    flex: '1',
    flexDirection: 'column'
  }
}));

/**
 * Layout for all project pages.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectsLayout: React.FC = (props) => {
  const classes = useStyles();

  return <Box className={classes.projectsLayoutRoot}>{props.children}</Box>;
};

export default ProjectsLayout;
