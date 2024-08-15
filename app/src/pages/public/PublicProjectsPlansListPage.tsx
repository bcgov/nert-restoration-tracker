import Container from '@mui/material/Container';
import PublicPlans from 'pages/public/PublicPlans';
import PublicProjects from 'pages/public/PublicProjects';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStateContext } from 'hooks/useAuthStateContext';

export default function PublicProjectsPlansListPage() {
  const authStateContext = useAuthStateContext();

  if (authStateContext.auth.isAuthenticated) {
    // User has a role
    return <Navigate replace to={{ pathname: '/admin/projects' }} />;
  }

  return (
    <Container maxWidth="xl">
      <PublicProjects />
      <PublicPlans />
    </Container>
  );
}
