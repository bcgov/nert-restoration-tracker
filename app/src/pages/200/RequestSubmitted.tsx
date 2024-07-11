import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import React from 'react';
import { Navigate } from 'react-router-dom';

const RequestSubmitted = () => {
  const authStateContext = useAuthStateContext();

  if (!authStateContext.auth || authStateContext.nertUserWrapper.isLoading) {
    return <CircularProgress className="pageProgress" />;
  }

  if (authStateContext.nertUserWrapper.hasOneOrMoreProjectRoles) {
    // User already has a role
    return <Navigate replace to={{ pathname: '/admin/projects' }} />;
  }

  if (authStateContext.nertUserWrapper.hasAccessRequest) {
    // User has no pending access request
    return <Navigate replace to={{ pathname: '/' }} />;
  }

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiCheck} size={2} color="#4caf50" />
        <h1>Access Request Submitted</h1>
        <Typography>Your access request has been submitted for review.</Typography>
        <Box pt={4}>
          <Button
            onClick={() => {
              authStateContext.auth.signoutRedirect();
            }}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            data-testid="logout-button">
            Log Out
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RequestSubmitted;
