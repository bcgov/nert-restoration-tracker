import Container from '@mui/material/Container';
import React from 'react';
import Plans from './Plans';
import Projects from './Projects';

/**
 * Main Project Plan Page
 */
const ProjectsPlansListPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Projects />
      <Plans />
    </Container>
  );
};

export default ProjectsPlansListPage;
