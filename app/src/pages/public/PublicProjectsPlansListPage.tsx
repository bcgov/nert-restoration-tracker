import Container from '@mui/material/Container';
import { AuthStateContext } from 'contexts/authStateContext';
import PublicPlans from 'pages/public/PublicPlans';
import PublicProjects from 'pages/public/PublicProjects';
import React, { useContext } from 'react';
import { Redirect } from 'react-router';

const PublicProjectsPlansListPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (keycloakWrapper?.keycloak.authenticated) {
    // User has a role
    return <Redirect to={{ pathname: '/admin/projects' }} />;
  }

  return (
    <Container maxWidth="xl">
      <PublicProjects />
      <PublicPlans />
    </Container>
  );
};

export default PublicProjectsPlansListPage;
