import Container from '@mui/material/Container';
import PublicPlans from 'pages/public/PublicPlans';
import PublicProjects from 'pages/public/PublicProjects';
import React from 'react';

export default function PublicProjectsPlansListPage() {
  return (
    <Container maxWidth="xl">
      <PublicProjects />
      <PublicPlans />
    </Container>
  );
}
